import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";

// DOMPurify (isomorphic-dompurify → jsdom) Vercel'de ERR_REQUIRE_ESM ile
// çöktüğü için (jsdom'un CJS bağımlılıkları artık sadece-ESM paketleri
// require ediyor) temizlik DOM'suz yapılıyor. fast-xml-parser zaten projede
// kullanılıyor ve CJS olarak sorunsuz yükleniyor.

// Beyaz liste: burada olmayan her etiket, içeriğiyle birlikte silinir
// (script, foreignObject, iframe, animate/set gibi olay/href değiştirebilen
// animasyon etiketleri vb.).
const SVG_ELEMENTS = new Set([
  "svg", "g", "defs", "symbol", "use", "title", "desc", "style",
  "path", "rect", "circle", "ellipse", "line", "polyline", "polygon",
  "text", "tspan", "textPath",
  "linearGradient", "radialGradient", "stop", "pattern", "clipPath", "mask", "marker", "image",
  "filter", "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feFlood",
  "feGaussianBlur", "feMerge", "feMergeNode", "feOffset", "feFuncA", "feFuncR", "feFuncG", "feFuncB",
  "feDropShadow", "feMorphology",
]);

// Beyaz liste: on* olay handler'ları dahil burada olmayan her özellik silinir.
const SVG_ATTRIBUTES = new Set([
  "id", "class", "style", "transform", "xmlns", "xmlns:xlink", "version", "x", "y", "width", "height",
  "viewBox", "preserveAspectRatio", "xml:space", "enable-background", "display", "visibility", "overflow",
  "fill", "fill-opacity", "fill-rule", "opacity", "color",
  "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit",
  "stroke-dasharray", "stroke-dashoffset", "stroke-opacity",
  "d", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry", "fx", "fy", "points", "pathLength",
  "offset", "stop-color", "stop-opacity", "gradientUnits", "gradientTransform", "spreadMethod",
  "clip-path", "clip-rule", "clipPathUnits", "mask", "maskUnits", "maskContentUnits",
  "patternUnits", "patternContentUnits", "patternTransform",
  "marker-start", "marker-mid", "marker-end", "markerWidth", "markerHeight", "markerUnits",
  "refX", "refY", "orient",
  "font-family", "font-size", "font-weight", "font-style", "text-anchor", "dominant-baseline",
  "letter-spacing", "word-spacing", "dx", "dy", "rotate", "textLength", "lengthAdjust", "startOffset",
  "filter", "filterUnits", "primitiveUnits", "in", "in2", "result", "stdDeviation", "mode",
  "operator", "values", "type", "k1", "k2", "k3", "k4", "flood-color", "flood-opacity",
  "tableValues", "slope", "intercept", "amplitude", "exponent", "radius",
  "href", "xlink:href",
]);

// href sadece belge içi referans (#id) ya da gömülü raster görsel olabilir;
// javascript:, harici URL'ler ve entity ile gizlenmiş varyantları elenir.
const SAFE_HREF = /^(#[\w.:-]+|data:image\/(png|jpe?g|gif|webp);base64,[a-z0-9+/=\s]+)$/i;

// CSS içinde harici kaynak çekebilecek @import ve #id dışındaki url(...)
// değerleri etkisizleştirilir.
function sanitizeCss(css: string): string {
  return css
    .replace(/@import[^;]*;?/gi, "")
    .replace(/url\(\s*(['"]?)(?!#)[^)]*\1\s*\)/gi, "none")
    .replace(/expression\s*\(|javascript:/gi, "");
}

type XmlNode = Record<string, unknown> & { ":@"?: Record<string, string> };

const XML_OPTIONS = {
  preserveOrder: true,
  ignoreAttributes: false,
  attributeNamePrefix: "",
  processEntities: false,
  cdataPropName: "#cdata",
} as const;

function cleanNodes(nodes: XmlNode[]): XmlNode[] {
  const result: XmlNode[] = [];
  for (const node of nodes) {
    const name = Object.keys(node).find((key) => key !== ":@");
    if (!name) continue;

    if (name === "#text" || name === "#cdata") {
      result.push(node);
      continue;
    }
    if (!SVG_ELEMENTS.has(name)) continue;

    const children = cleanNodes((node[name] as XmlNode[]) ?? []);
    const cleaned: XmlNode = {
      [name]:
        name === "style"
          ? children.map((child) => sanitizeTextNode(child))
          : children,
    };

    const attrs: Record<string, string> = {};
    for (const [attr, value] of Object.entries(node[":@"] ?? {})) {
      if (!SVG_ATTRIBUTES.has(attr)) continue;
      if ((attr === "href" || attr === "xlink:href") && !SAFE_HREF.test(value.trim())) continue;
      attrs[attr] = attr === "style" ? sanitizeCss(value) : value;
    }
    if (Object.keys(attrs).length > 0) cleaned[":@"] = attrs;

    result.push(cleaned);
  }
  return result;
}

function sanitizeTextNode(node: XmlNode): XmlNode {
  if ("#text" in node) return { "#text": sanitizeCss(String(node["#text"])) };
  if ("#cdata" in node) {
    const inner = (node["#cdata"] as XmlNode[]).map((child) => sanitizeTextNode(child));
    return { "#cdata": inner };
  }
  return node;
}

export class InvalidSvgError extends Error {}

// XML bildirimi, DOCTYPE, yorumlar ve işleme talimatları atılır; kök <svg>
// değilse ya da XML bozuksa InvalidSvgError fırlatılır.
export function sanitizeSvg(source: string): string {
  if (XMLValidator.validate(source) !== true) throw new InvalidSvgError("SVG dosyası geçerli bir XML değil.");

  const tree = new XMLParser(XML_OPTIONS).parse(source) as XmlNode[];
  const roots = tree.filter((node) => Object.keys(node).some((key) => key !== ":@" && !key.startsWith("?") && key !== "#text"));
  if (roots.length !== 1 || !("svg" in roots[0])) {
    throw new InvalidSvgError("Dosyanın kök öğesi <svg> değil.");
  }

  return new XMLBuilder(XML_OPTIONS).build(cleanNodes(roots));
}

// Sadece düz metin bırakır: <script>/<style> blokları içerikleriyle, diğer
// etiketler sadece kendileri silinir. Sonuç React tarafından zaten escape
// edilerek render edildiği için bu adım XSS değil, temiz veri içindir.
export function sanitizePlainText(value: string): string {
  return value
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}
