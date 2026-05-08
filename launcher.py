"""
稲作のことば — スタンドアロン起動スクリプト
=============================================

このスクリプト + ゲームファイルを同梱した .exe を PyInstaller で生成すると、
受け取った人は exe をダブルクリックするだけでブラウザでゲームが起動します。

仕組み:
- 空きポートを探して http.server を起動 (ローカルホストのみバインド)
- システムの既定ブラウザでそのURLを開く
- ブラウザを閉じても server は残るので、コンソールウィンドウを閉じれば停止
"""
import http.server
import socketserver
import threading
import webbrowser
import socket
import sys
import os
import io

# Windows コンソールが cp932 でも絵文字をクラッシュさせない
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    # 古い Python や reconfigure 不可な場合
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
    except Exception:
        pass


def safe_print(text: str):
    """エンコーディングエラーで止まらないように出力する."""
    try:
        print(text)
    except Exception:
        try:
            print(text.encode("ascii", errors="replace").decode("ascii"))
        except Exception:
            pass


def get_resource_path(rel_path: str) -> str:
    """PyInstaller の onefile ビルドにも対応する."""
    base = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base, rel_path)


def find_free_port(start: int = 53151, end: int = 53251) -> int:
    """ループバックで空きポートを探す."""
    for p in range(start, end):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.bind(("127.0.0.1", p))
            s.close()
            return p
        except OSError:
            continue
    raise RuntimeError("free port が見つかりません")


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    """アクセスログを無音化する."""
    def log_message(self, format, *args):
        return


def main():
    serve_root = get_resource_path("game")
    if not os.path.isdir(serve_root):
        # 開発時にこのスクリプトを直接実行した場合は同階層をルートに
        serve_root = os.path.dirname(os.path.abspath(__file__))
    os.chdir(serve_root)

    port = find_free_port()
    url = f"http://127.0.0.1:{port}/index.html"

    handler_cls = QuietHandler
    httpd = socketserver.TCPServer(("127.0.0.1", port), handler_cls)

    # サーバはバックグラウンド
    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()

    safe_print("=" * 60)
    safe_print("  🌾 稲作のことば")
    safe_print("=" * 60)
    safe_print(f"  ブラウザで自動的に開きます: {url}")
    safe_print("  ※ このウィンドウを閉じるとゲームのサーバが止まります")
    safe_print("=" * 60)

    try:
        webbrowser.open(url)
    except Exception as e:
        safe_print(f"ブラウザの自動起動に失敗: {e}")
        safe_print(f"上記のURLを手動で開いてください")

    try:
        # メインスレッドを生かしておく
        server_thread.join()
    except KeyboardInterrupt:
        safe_print("\n停止します...")
        httpd.shutdown()


if __name__ == "__main__":
    main()
