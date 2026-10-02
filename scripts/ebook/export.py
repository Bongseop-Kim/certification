"""usable.json → questions/practical/practical-2026.json. 사용: python3 export.py <bookdir> <out.json>

필기 풀(`questions/written`)과 형식이 달라(서술·복수 빈칸) 섞지 않는다. 채점은 자가 채점(grading: "self").
본문 끝에 딸려 온 파트 제목('2 작업형')과 연속 중복 줄만 정리한다. 내용은 고치지 않는다.
"""
import json, re, sys
from pathlib import Path

TAIL = re.compile(r"^\d\s*(단답형|서술형|작업형)$")
# 사이트 분류(유형별 3종). 원래 kind는 그대로 두고 type만 접는다.
TYPE = {"단답형": "short", "term": "short", "multi-blank": "short", "서술형": "essay", "descriptive": "essay", "작업형": "task"}


HANGUL = re.compile(r"[가-힣]")
IP = re.compile(r"(?<!\d)(\d{1,3})\.[ \t]*(\d{1,3})[ \t]*\.[ \t]*(\d{1,3})[ \t]*\.[ \t]*(\d{1,3})(?!\d)")
# 터미널 프롬프트·대표 명령으로 시작하는 줄은 코드 블록의 시작으로 본다
PROMPT = re.compile(r"^[┌└├│]|^[#$] ?\S|^\w+@[\w-]+[:~#$ ]|^\(root")
MAIL = re.compile(r"^(Delivered-To|Received(-SPF)?|Return-Path|From|To|Cc|Subject|Date|Message-ID|MIME-Version|Content-[\\w-]+|X-[\\w-]+|Authentication-Results|DKIM-Signature|ARC-[\\w-]+|Host|User-Agent|Cookie|Referer|GET|POST|PUT|HEAD|HTTP/\\d)\\b[ :/]")
CMD = re.compile(r"^(ftp|ssh|ls|cat|iptables|snort|nmap|tcpdump|curl|wget|chmod|chown|find|grep|netstat|ifconfig|ping|sudo|echo|systemctl|useradd|passwd|mount)\b")
SYM = re.compile(r"[{};]|=>|->|://|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|^\d{3} \S")


def strong(l):
    t = l.strip()
    if PROMPT.match(t) and t[:1] in "#$" and HANGUL.search(t):
        return False
    return bool(PROMPT.match(t) or CMD.match(t) or MAIL.match(t))


def codey(l):
    return strong(l) or bool(SYM.search(l))


def split_merged(ls):
    """영문 출력이 한 줄로 뭉친 줄과 그 줄을 쪼갠 줄이 같이 읽힌 경우, 뭉친 줄을 앞부분만 남긴다."""
    out = []
    for i, l in enumerate(ls):
        cut = len(l)
        if len(l) > 40 and not HANGUL.search(l):
            for m in ls[i + 1:]:
                m = m.strip()
                if len(m) >= 8 and m != l.strip() and m in l:
                    cut = min(cut, l.index(m))
        out.append(l[:cut].rstrip())
    return [l for l in out if l.strip()]


def english_run(ls, i):
    """한글 없이 12자 이상인 줄이 3줄 이상 이어지면 로그·코드로 본다."""
    run = ls[i:i + 3]
    return len(run) == 3 and all(not HANGUL.search(x) and len(x.strip()) >= 12 for x in run)


def fence_code(ls):
    """터미널·설정·메일 헤더 구간을 ``` 로 감싼다. 화면이 고정폭 상자로 그린다."""
    out, i = [], 0
    while i < len(ls):
        if i and (strong(ls[i]) or english_run(ls, i)):
            j = i + 1
            while j < len(ls) and (codey(ls[j]) or not HANGUL.search(ls[j])):
                if START.match(ls[j]) and HANGUL.search(ls[j]):
                    break
                j += 1
            blk = ls[i:j]
            if len(blk) >= 2 or not HANGUL.search(ls[i]):
                out += ["```", *blk, "```"]
                i = j
                continue
        out.append(ls[i])
        i += 1
    return out


# 줄 머리가 라벨·불릿·번호·제목이면 새 줄로 둔다
START = re.compile(r"^\s*(?:[•·▪◦\-–]\s*|\(\s*[ㄱ-ㅎA-Za-z0-9]\s*\)|\d{1,2}\s?[.)]\s|[①-⑳]|[가-하]\.\s|<[^>]{1,12}>|[\[【][^\]】]{1,12}[\]】]|[※■▶◆▷])")
END = re.compile(r"[.?!:;。]$|[.?!]\)$")


VOCAB = {}
PREFIX = set()


def build_vocab(texts):
    """교재 전체에서 줄 끝·줄 머리가 아닌 자리의 한글 단어를 센다. 줄바꿈으로 갈라진 단어를 되붙일 때 쓴다."""
    for t in texts:
        for line in t.split("\n"):
            toks = re.findall(r"[가-힣]+", line)
            for w in toks[1:-1]:
                VOCAB[w] = VOCAB.get(w, 0) + 1
                for n in range(2, len(w)):
                    PREFIX.add(w[:n])  # '노출된'이 있으면 '노출'도 단어의 앞부분으로 본다


def glue(p, l):
    """이어 붙일 때 사이에 공백을 넣을지 정한다. 붙이면 교재 다른 곳에 있는 단어가 되면 공백 없이 붙인다."""
    if p[-1] in "(/-[" or l.lstrip()[:1] in ")],./":
        return ""
    x = re.search(r"[가-힣]+$", p)
    y = re.match(r"[가-힣]+", l.lstrip())
    if x and y:
        # 다음 줄 머리의 전체·2글자·1글자를 붙였을 때 교재에 있는 단어가 되면 단어 중간 끊김으로 본다
        for n in sorted({len(y.group()), 2, 1}, reverse=True):
            cand = x.group() + y.group()[:n]
            if n <= len(y.group()) and (VOCAB.get(cand, 0) >= 1 or cand in PREFIX):
                return ""
    return " "


def reflow(ls):
    """책의 줄바꿈 때문에 문장 중간에서 끊긴 줄을 공백으로 이어 붙인다. 코드 상자·라벨·불릿 줄은 건드리지 않는다."""
    out, fence, prev_plain = [], False, False
    for l in ls:
        if l.strip() == "```":
            fence = not fence
            out.append(l)
            prev_plain = False
            continue
        if fence:
            out.append(l)
            prev_plain = False
            continue
        p = out[-1].rstrip() if out else ""
        if prev_plain and len(p) >= 30 and not END.search(p) and not START.match(l):
            out[-1] = p + glue(p, l) + l.lstrip()
        else:
            out.append(l)
        prev_plain = True
    return out


def fix_bullets(ls):
    """글자 없는 불릿 줄: 뒤 줄이 일반 문장이면 그 줄의 불릿으로 붙이고, 아니면 지운다."""
    out, i = [], 0
    while i < len(ls):
        if ls[i].strip() in ("•", "·"):
            nxt = ls[i + 1] if i + 1 < len(ls) else ""
            if nxt.strip() and nxt.strip() != "```" and not START.match(nxt):
                out.append("•" + nxt.lstrip())
                i += 2
                continue
            i += 1
            continue
        out.append(ls[i])
        i += 1
    return out


def clean(text, code=False):
    text = IP.sub(r"\1.\2.\3.\4", text)
    text = re.sub(r"(\d) \.$", r"\1.", text, flags=re.M)
    text = re.sub(r"^(\d{1,2}) \. ", r"\1. ", text, flags=re.M)  # '1 . 여러' 같은 번호 뒤 공백
    ls = split_merged(text.split("\n"))
    out = []
    for l in ls:
        if out and out[-1] == l:
            continue
        out.append(l)
    while out and TAIL.match(out[-1].strip()):
        out.pop()
    out = fix_bullets(out)
    if code and "```" not in text:
        out = fence_code(out)
    return "\n".join(reflow(out)).strip()


def main(book, dest):
    items = json.load(open(Path(book, "usable.json")))
    build_vocab(t for it in items for t in (it["body"], it["answer"], it.get("explanation") or ""))
    out = []
    for it in items:
        mock = it["source"] == "mock"
        key = f"practical-2026:mock:{it['no']}" if mock else f"practical-2026:{it['source']}:{it['no']}"
        y, r = (None, None) if mock else it["source"].split("-")
        out.append({
            "key": key,
            "source": "2026 정보보안기사 실기 기출 600제 · " + ("실전 모의고사 " + it["no"] if mock else f"{y}년 {r}회 {it['no']}번"),
            "kind": it["kind"],
            "type": TYPE.get(it["kind"]) or ("essay" if len(it["answer"]) > 200 else "short"),  # 원본에 유형 표시가 없는 문항은 정답 길이로
            "grading": "self",
            "body": clean(it["body"], code=True),
            "answer": clean(it["answer"]),
            "explanation": clean(it["explanation"]) or None,
            "pages": it["pages"],
            "check": it["verdict"],  # ok | minor — 책과 대조 전 자동 판정
            **({"ai": it["ai"]} if it.get("ai") else {}),  # restored | inferred | adjusted — AI가 복구·추정·보정한 문항
        })
    Path(dest).parent.mkdir(parents=True, exist_ok=True)
    Path(dest).write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n")
    print(f"{len(out)} → {dest}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
