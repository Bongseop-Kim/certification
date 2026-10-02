import ApplicationServices
import Foundation
// usage: ax <pid> info | goto <page> | dump <outdir> | dump-top <outdir> | dump-frames <outdir>
// ponytail: 뷰어가 전 페이지를 AXPage로 노출하므로 페이지 이동 없이 한 번에 읽는다.
let pid = pid_t(CommandLine.arguments[1])!
let app = AXUIElementCreateApplication(pid)
func attr(_ e: AXUIElement, _ a: String) -> AnyObject? {
  var v: AnyObject?; return AXUIElementCopyAttributeValue(e, a as CFString, &v) == .success ? v : nil
}
func kids(_ e: AXUIElement) -> [AXUIElement] { (attr(e, kAXChildrenAttribute) as? [AXUIElement]) ?? [] }
// top=true: 값이 있는 노드에서 멈춘다(자식은 같은 글을 줄·낱말로 쪼갠 중복).
func text(_ e: AXUIElement, top: Bool = false) -> String {
  var out = ""
  func w(_ e: AXUIElement) {
    if let v = attr(e, kAXValueAttribute) as? String, !v.isEmpty { out += v + "\n"; if top { return } }
    kids(e).forEach(w)
  }
  w(e); return out
}
let win = (attr(app, kAXWindowsAttribute) as! [AXUIElement])[0]
let top = kids(win)
let field = top.first { (attr($0, kAXRoleAttribute) as? String) == "AXTextField" }!
func find(_ e: AXUIElement, _ d: Int) -> AXUIElement? {
  if (attr(e, kAXRoleAttribute) as? String) == "AXGroup", [kAXDescriptionAttribute, kAXTitleAttribute, kAXValueAttribute].contains(where: { (attr(e, $0) as? String) == "문서" }) { return e }
  if d > 3 { return nil }
  for k in kids(e) { if let r = find(k, d + 1) { return r } }; return nil
}
let doc = find(win, 0)
switch CommandLine.arguments[2] {
case "info":
  print("page:", attr(field, kAXValueAttribute) ?? "nil")
  var names: CFArray?; AXUIElementCopyActionNames(field, &names); print("actions:", names ?? [] as CFArray)
  var s: DarwinBoolean = false; AXUIElementIsAttributeSettable(field, kAXValueAttribute as CFString, &s); print("settable:", s)
  if let doc { for (i, k) in kids(doc).enumerated() { let t = text(k); print(i, attr(k, kAXRoleAttribute) ?? "", t.count, t.prefix(60).replacingOccurrences(of: "\n", with: "⏎")) } }
case "goto":
  AXUIElementSetAttributeValue(field, kAXFocusedAttribute as CFString, kCFBooleanTrue)
  print("set:", AXUIElementSetAttributeValue(field, kAXValueAttribute as CFString, CommandLine.arguments[3] as CFString).rawValue)
  print("confirm:", AXUIElementPerformAction(field, kAXConfirmAction as CFString).rawValue)
case "dump-frames":
  // 페이지별 JSON Lines: 값이 있는 최상위 노드의 텍스트와 화면 좌표. 띄어쓰기·겹침 판단용.
  let dir = CommandLine.arguments[3]
  try! FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true)
  for (i, k) in kids(doc!).enumerated() {
    var lines: [String] = []
    func w(_ e: AXUIElement) {
      if let v = attr(e, kAXValueAttribute) as? String, !v.isEmpty {
        var r = CGRect.zero
        if let f = attr(e, "AXFrame") { AXValueGetValue(f as! AXValue, .cgRect, &r) }
        let o: [String: Any] = ["v": v, "x": r.origin.x, "y": r.origin.y, "w": r.width, "h": r.height]
        lines.append(String(data: try! JSONSerialization.data(withJSONObject: o), encoding: .utf8)!)
        return
      }
      kids(e).forEach(w)
    }
    w(k)
    try! (lines.joined(separator: "\n") + "\n").write(toFile: String(format: "%@/%04d.jsonl", dir, i + 1), atomically: true, encoding: .utf8)
  }
  print("pages:", kids(doc!).count)
case "dump", "dump-top":
  let top = CommandLine.arguments[2] == "dump-top"
  let dir = CommandLine.arguments[3]
  try! FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true)
  for (i, k) in kids(doc!).enumerated() {
    try! text(k, top: top).write(toFile: String(format: "%@/%04d.txt", dir, i + 1), atomically: true, encoding: .utf8)
  }
  print("pages:", kids(doc!).count)
default: break
}
