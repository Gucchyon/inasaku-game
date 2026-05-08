#!/usr/bin/env python3
"""
dictionary.tsv を vocabulary_dict_import.js に変換する。

- 既存 vocabulary.js の英単語と重複する場合はスキップ
- カテゴリは英語キーワードでヒューリスティック判定
- 出力先: js/data/vocabulary_dict_import.js
- 各エントリに source: { type: "user_dictionary" } を付与
"""
import re
import sys
from pathlib import Path

PROJ_ROOT = Path(__file__).resolve().parent.parent
TSV_PATH = PROJ_ROOT / "dictionary.tsv"
VOCAB_PATH = PROJ_ROOT / "js" / "data" / "vocabulary.js"
OUT_PATH = PROJ_ROOT / "js" / "data" / "vocabulary_dict_import.js"

# === カテゴリ判定ルール（先勝ち） ===
# 注: 単独語と複合語を区別。空白/ハイフンを含むキーは substring match、
# 含まないキーは正規表現の \b...\b で単語境界マッチ（例: "rain" が "grain" にマッチしない）。
CATEGORY_RULES = [
    # 1. 病害虫 (最優先で雑草・病害虫系を抑える)
    ("pest_disease", [
        "blight", "smut", "blast", "mildew", "rot", "wilt", " borer", "borer ", "hopper", "mite", "nematode",
        "virus", "viral", "bacteria", "bacterial", "fungus", "fungal", "fungi", "insect ", " insect", "pest",
        "disease", "pathogen", "infection", "infest", "infected", "weed ", " weed", "weeds", "weeding",
        "leaffolder", "leaf folder", "scab", "rust", "leaf spot", "stink", "planthopper", "stem borer",
        "herbicide", "insecticide", "fungicide", "bakanae", "false smut",
        "white head", "neck blast", "panicle blast", "bacterial leaf blight", "leaf roll",
        "predator", "biological control", "pesticide", "stalk rot", "stem rot", "root rot",
        "dead heart", "host resistance", "resistance gene", "iron chlorosis", "chlorosis"
    ]),

    # 2. 育種・遺伝
    ("breeding", [
        "cultivar", "variety", "varietal", "breeding", "hybrid", "cross", "selection",
        "gene", "chromosome", "inheritance", "qtl", "marker", "genome", "genomic", "genotype",
        "phenotype", "mutation", "domestication", "landrace", "backcross", "combining ability",
        "heritability", "allele", "inbreeding", "outcrossing", "self-fertilization", "self-pollination",
        "self-incompatibility", "polyploid", "haploid", "doubled haploid", "tissue culture", "anther culture",
        "embryo culture", "embryo rescue", "embryogenesis", "transgenic", "gene flow", "germplasm",
        "core collection", "pedigree", "pure line", "synthetic variety", "gene bank", "epigenetic",
        "dna", "rna", "mass selection", "line selection", "doubled", "japonica", "indica", "heterosis",
        "vigor", "hybrid rice", "hybrid vigor", "seed certification", "certified seed",
        "metabolome", "transcriptome", "proteome", "cisgenesis", "gmo", "qpcr",
        "molecular", "wild relative", "wild species", "subspecies", "ecotype", "genetic",
        "accession", "apomixis", "autogamy", "center of origin", "chromatin", "clonal",
        "domesticated", "molecular breeding", "cross-pollination", "bulk breeding",
        "double cross", "single cross", "test cross", "mas", "marker-assisted",
        "trisomic", "monogenic", "polygenic", "f1", "f2", "f3"
    ]),

    # 3. 生育段階
    ("growth_stage", [
        "germination", "emergence", "seedling stage", "seedling age", "tillering", "active till",
        "panicle initiation", "booting", "heading stage", "flowering stage", "anthesis", "ripening period",
        "maturity stage", "vegetative phase", "vegetative growth", "reproductive stage", "flag leaf stage",
        "elongation stage", "juvenile phase", "developmental phase", "developmental stages",
        "growth stage", "growing season", "growth duration", "crop development stage",
        "bunching", "internode elongation", "tasseling", "silking", "post-emergence",
        "flowering date", "heading date", "days to heading", "days to maturity", "harvest maturity",
        "physiological maturity", "harvest date", "maturation", "growth phase", "phenology",
        "phenological", "flowering duration", "floral initiation", "flower initiation"
    ]),

    # 4. 形態
    ("morphology", [
        "leaf blade", "leaf sheath", "flag leaf", "auricle", "awn", "awns", "panicle", "panicles",
        "spikelet", "culm", "node", "internode", "tiller", "hull", "hulls",
        "embryo", "endosperm", "stomata", "stomatal", "axillary bud", "lateral root", "aerial roots",
        "leaf area", "leaf angle", "leaf temperature", "leaf age", "leaf color", "leaf chlorophyll",
        "leaf development", "leaf elongation", "leaf emergence", "leaf expansion", "leaf position",
        "leaf senescence", "leaf thickness", "leaf water potential", "leaf wilting", "pubescence",
        "panicle length", "panicle structure", "panicle type", "panicle development",
        "panicle emergence", "panicle exsertion", "root length", "root mass", "root system",
        "root tip", "root architecture", "root distribution", "root elongation", "root growth",
        "root morphology", "root pressure", "root pruning", "root zone", "root development",
        "root activity", "root biomass", "root exudate", "root penetration", "root-shoot ratio",
        "rootstock", "plant height", "plant length", "shoot ", " shoot", "morphological",
        "form", "anatomy", "branching", "apical", "meristem", "tasseling"
    ]),

    # 5. 生理
    ("physiology", [
        "photosynthesis", "respiration", "transpiration", "translocation", "assimilation",
        "metabolism", "metabolic", "hormone", "signal", "enzyme", "enzymatic", "chlorophyll",
        "stress", "tolerance", "abiotic", "biotic stress", "acclimation", "adaptation",
        "abscisic", "auxin", "cytokinin", "gibberellin", "ethylene", "antioxidant", "oxidative",
        "carbohydrate", "sucrose", "starch", "sink", "source-sink", "source",
        "partition", "allocation", "water potential", "osmotic", "osmolyte", "proline",
        "membrane", "ion balance", "calcium signaling", "salt tolerance", "salt stress",
        "salinity stress", "salinity tolerance", "drought tolerance", "drought resistance",
        "drought stress", "drought avoidance", "drought escape", "drought hardening",
        "heat tolerance", "heat stress", "cold tolerance", "cold stress", "cold acclimation",
        "cold resistance", "thermotolerance", "thermal stress", "stomatal conductance",
        "stomatal resistance", "vernalization", "phytochrome", "photoperiod", "circadian",
        "dormancy", "senescence", "viability", "phenology", "carbon fixation", "carbon allocation",
        "carbon use", "carbon sequestration", "calvin cycle", "cam pathway", "electron transport",
        "phytotoxicity", "wax content", "lignification", "desiccation",
        "phloem", "xylem", "potential", "induction", "inducible", "respiration rate",
        "transpiration rate", "anthesis", "photosynthate", "photosynthetic", "net photosynthesis",
        "net assimilation", "dark respiration", "light response", "light saturation",
        "light compensation", "light use efficiency", "light interception", "light intensity",
        "growth rate", "relative growth", "growth model", "growth analysis", "growth regulator",
        "energy balance", "cell", "homeostasis", "regulation", "allelopathy", "allelopathic",
        "biomass", "canopy photosynthesis", "carbon isotope", "competition response",
        "assimilate", "fluorescence", "isotope", "chlorosis", "etiolation", "polarity",
        "elongation", "differentiation", "primordium", "initiation"
    ]),

    # 6. 病害虫（広めに）追加なし

    # 7. 土壌・肥料
    ("soil_fertilizer", [
        "fertilizer", "fertilization", "fertilize", "nitrogen", "phosphorus", "potassium",
        "nutrient", "compost", "manure", "micronutrient", "macronutrient", "mineral nutrition",
        "deficiency", "topdressing", "top dressing", "basal", "side dressing",
        "soil", "clay", "loam", "humus", "ph stress", "soil ph", "salinity",
        "moisture", "drainage", "tillage", "conservation tillage", "harrowing",
        "puddling", "land preparation", "compaction", "porosity", "aeration",
        "organic matter", "organic fertilizer", "green manure", "trace element",
        "mineral deficiency", "calcium deficiency", "potassium deficiency", "phosphorus deficiency",
        "iron deficiency", "zinc deficiency", "nutrient solution", "nutrient absorption",
        "nutrient availability", "nutrient balance", "nutrient management", "nutrient transport",
        "nutrient uptake", "nutrient stress", "ph", "fertility", "leaching", "amendment",
        "field capacity", "available water", "water holding", "rhizosphere", "endophyte",
        "soil bacteria", "soil-borne", "soil organic", "biological nitrogen", "symbiotic",
        "bottom dressing", "bulk density", "cec", "exchangeable", "base saturation",
        "soil profile", "soil structure", "soil texture", "soil type", "subsoil"
    ]),

    # 8. 気候・環境
    ("climate", [
        "drought", "flooding", "flood", "typhoon", "frost", "cool summer", "heat injury",
        "heat wave", "cold injury", "low temperature", "high temperature", "temperature stress",
        "rainfall", "rain ", "climate", "weather", "humidity", "wind ", "microclimate",
        "lodging", "lodging resistance", "non-lodging", "winter", "summer", "spring", "autumn",
        "global warming", "climate change", "greenhouse effect", "greenhouse gas",
        "evapotranspiration", "submergence", "flooding tolerance", "waterlogging", "water table",
        "winter hardiness", "winter killing", "winter crop", "summer crop", "frost damage",
        "frost resistance", "wind damage", "wind injury", "weather damage", "deep water rice",
        "tropical", "terminal drought", "thermal time", "degree day", "growing degree",
        "heat accumulation", "base temperature"
    ]),

    # 9. 収穫・調製・品質・収量
    ("harvest_postharvest", [
        " yield", "yield ", "harvest", "grain quality", "grain moisture", "grain weight",
        "grain number", "grain shape", "grain size", "grain hardness", "grain protein",
        "grain filling", "grain development", "grain abortion", " drying", "drying ",
        " storage", "storage ", "milling", "milled rice", "brown rice", "white rice",
        "polishing", "threshing", "panicle weight", "spikelet number", "spikelet fertility",
        "spikelet sterility", "appearance quality", "cooking quality", "eating quality",
        "cracked grain", "chalky grain", "whole grain", "filled grain", "immature grain",
        "inspection grade", "protein content", "amylose content", "test weight", "moisture content",
        "post-harvest", "harvest index", "harvest loss", "shattering", "shattering resistance",
        "rice quality", "rice mill", "rice husk", "rice bran", "rice straw", "harvesting",
        "machine harvesting", "manual harvesting", "harvest date", "harvest maturity",
        "tuber formation", "field loss", "field performance", "shelf life", "deterioration",
        "harvest robot", "fruit drop", "fruit set", "fruit development",
        "yield component", "yield gap", "yield loss", "yield plateau", "yield potential",
        "yield stability", "yield trend", "high yielding", "biological yield",
        "crop load", "post-emergence", "machine harvest", "white head"
    ]),

    # 10. 栽培管理
    ("cultivation", [
        "irrigation", "irrigated", "transplant", "transplanting", "direct seeding",
        "planting", "tillage", "cultivation", "farming", "agriculture", "agricultural",
        "agroecosystem", "agroforestry", "aeroponics", "crop ", " crop", "crops",
        "border effect", "bordering", "land productivity", "land use", "cultivated area",
        "site-specific", "damage assessment", "monitoring", "scouting", "screening",
        "production", "sowing", "cropping", "nursery", "weeding", "weed suppression",
        "weed control", "weed management", "spraying", "machinery", "machine", "robot",
        "gps", "sensor", "sensing", "imagery", "precision", "smart agriculture",
        "controlled environment", "automated", "labor", "mechanization", "extension",
        "policy", "economy", "cooperative", "market", "food", "season", "calendar",
        "field plot", "field trial", "field screening", "field mapping", "field emergence",
        "row spacing", "ridge planting", "deep planting", "dense planting", "double cropping",
        "multiple cropping", "mixed cropping", "intercropping", "monoculture", "rotation",
        "crop rotation", "rainfed", "subsistence", "intensive", "conservation agriculture",
        "agroforestry", "organic farming", "organic rice", "smart", "digital agriculture",
        "precision farming", "site-specific", "remote sensing", "near infrared", "hyperspectral",
        "satellite", "aerial", "image analysis", "spectral", "fluorescence imaging",
        "decision support", "machine learning", "deep learning", "data mining", "big data",
        "blockchain", "iot", "ai-based", "artificial intelligence", "edge computing",
        "cloud computing", "digital twin", "automated steering", "autonomous", "agricultural robot",
        "labor-saving", "transplanter", "combine harvester", "weeding robot", "seedling tray",
        "seedbed", "seed treatment", "seed dressing", "seed disinfection", "crop residue",
        "stubble", "burning", "no-till", "minimum tillage", "reduced tillage", "minimal tillage",
        "ratoon", "perennial crop", "second crop", "main crop", "cash crop", "feed crop",
        "fodder crop", "forage crop", "seed production", "seed multiplication", "seed lot",
        "seed grade", "seed purity", "seed certification", "fair trade", "farmers' market",
        "farm management", "crop scout", "scouting", "crop monitor", "monitoring",
        "crop modeling", "crop simulation", "crop coefficient", "crop calendar",
        "seedbed preparation", "land use", "row ", " row", "off-season", "fallowing",
        "thinning", "puddling", "harrowing", "spraying", "nursery management",
        "good agricultural practice", "gap", "biosafety", "biosecurity", "traceability",
        "food safety", "food security", "food sovereignty", "food science", "food miles",
        "cooking", "biopesticide", "extension service"
    ]),
]

# === 一般 fallback ===
DEFAULT_CATEGORY = "general"

# === 既存 vocabulary.js から英単語抽出 ===
def get_existing_english():
    text = VOCAB_PATH.read_text(encoding="utf-8")
    # en: "..." を抽出
    return set(m.group(1).lower().strip() for m in re.finditer(r'en:\s*"([^"]+)"', text))

# === 難易度推定 (粗い) ===
def estimate_difficulty(en):
    # 単語数が多い・長いほど難しい、複合語・高度な専門語は3
    en_lower = en.lower()
    words = en_lower.split()
    hard_keywords = ["genome", "qtl", "epigenet", "marker assist", "transgenic", "doubled haploid",
                     "metabolom", "transcriptom", "proteom", "blockchain", "phenotyping",
                     "isotope", "hyperspectral", "biofortif", "edge comput", "digital twin",
                     "circadian", "abscisic", "vernalization", "phytochrome", "phenolog",
                     "translocation", "assimilation", "homeostasis", "rhizosphere", "endophyt",
                     "panicle initiation", "internode", "translocation", "polyploid"]
    easy_keywords = ["rice", "soil", "leaf", "root", "stem", "seed", "weed", "field",
                     "germination", "yield", "harvest", "crop", "plant", "water"]
    if any(k in en_lower for k in hard_keywords):
        return 3
    if len(words) == 1 and any(k in en_lower for k in easy_keywords):
        return 1
    if len(words) >= 3 or len(en) > 25:
        return 3
    if len(words) >= 2:
        return 2
    return 2

# === カテゴリ判定 (単語境界マッチで誤分類を抑制) ===
# キーワードに空白が含まれる場合は複合語として substring マッチ、
# 単独語の場合は \b...\b の単語境界マッチを使用。
def _make_pattern(k):
    k = k.strip()
    if " " in k or "-" in k:
        # 複合語: そのまま含有判定
        return re.compile(re.escape(k.lower()))
    # 単独語: 単語境界
    return re.compile(r"\b" + re.escape(k.lower()) + r"\b")

# 事前コンパイル
_COMPILED_RULES = [(cat, [_make_pattern(k) for k in keys]) for cat, keys in CATEGORY_RULES]

def categorize(en):
    en_lower = en.lower()
    for cat, patterns in _COMPILED_RULES:
        for p in patterns:
            if p.search(en_lower):
                return cat
    return DEFAULT_CATEGORY

# === メイン処理 ===
def main():
    existing = get_existing_english()
    print(f"既存vocabulary.js の英単語数: {len(existing)}", file=sys.stderr)

    entries = []
    skipped_dup = 0
    cat_counts = {}

    with TSV_PATH.open(encoding="utf-8") as f:
        for i, line in enumerate(f, 1):
            line = line.rstrip("\r\n")
            if not line or "\t" not in line:
                continue
            parts = line.split("\t", 1)
            if len(parts) != 2:
                continue
            en = parts[0].strip()
            ja = parts[1].strip()
            if not en or not ja:
                continue
            en_lower = en.lower()
            if en_lower in existing:
                skipped_dup += 1
                continue
            cat = categorize(en)
            diff = estimate_difficulty(en)
            cat_counts[cat] = cat_counts.get(cat, 0) + 1
            entries.append({
                "en": en,
                "ja": ja,
                "category": cat,
                "difficulty": diff
            })

    print(f"スキップ (重複): {skipped_dup}", file=sys.stderr)
    print(f"取り込み対象: {len(entries)}", file=sys.stderr)
    print("カテゴリ分布:", file=sys.stderr)
    for k, v in sorted(cat_counts.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}", file=sys.stderr)

    # 出力
    out = []
    out.append("// dictionary.tsv からの自動取り込み")
    out.append(f"// 生成: {len(entries)} 件 (重複 {skipped_dup} 件スキップ)")
    out.append("// カテゴリは英語キーワードで自動判定。誤分類は手動で修正してください。")
    out.append("// altJa (かな読み) と example は未生成。手動で補強する場合は vocabulary.js に移して編集を。")
    out.append("// 出典: ユーザー提供 dictionary.tsv (1011 entries)")
    out.append("(function () {")
    out.append("  if (!window.VOCAB) window.VOCAB = [];")
    out.append("  const ADD = [")
    for i, e in enumerate(entries, 1):
        en_esc = e["en"].replace('"', '\\"')
        ja_esc = e["ja"].replace('"', '\\"')
        idx = f"imp_{i:04d}"
        out.append(f'    {{ id: "{idx}", en: "{en_esc}", ja: ["{ja_esc}"], pos: "n.", category: "{e["category"]}", difficulty: {e["difficulty"]}, source: {{ type: "user_dictionary" }} }},')
    out.append("  ];")
    out.append("  Array.prototype.push.apply(window.VOCAB, ADD);")
    out.append("})();")
    OUT_PATH.write_text("\n".join(out), encoding="utf-8")
    print(f"\n書き出し完了: {OUT_PATH}", file=sys.stderr)

if __name__ == "__main__":
    main()
