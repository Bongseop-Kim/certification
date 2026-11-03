const { seg, eo } = kit;
kit.scene('recap', {
  init(kit) {
    kit.stage.append(kit.h('<div class="ground"><div class="desk"></div>' +
      '<div class="words" style="left:130px;top:110px;width:1600px"><h2 class="line rc-h">업로드 필터를 우회하는 세 가지</h2></div>' +
      '<div class="cap rc-cap">2025년 2회 실기에는 마임 타입만 검사하는 코드의 우회 방법이 나왔습니다</div></div>'));
    const m = v => '<span class="mono">' + v + '</span>';
    this.tb = UI.table(kit, { x: 130, y: 270, w: 1660, size: 44, widths: ['1.3fr', '1fr', '1fr'],
      head: ['우회 방법', '바꾸는 것', '예시'],
      rows: [['콘텐츠 타입 변조', '요청의 꼬리표', m('image/gif')], ['이중 확장자', '파일 이름', m('shell.php.jpg')], ['매직 바이트 위조', '파일 첫 바이트', m('GIF89a')]],
      hl: [0, 0] });
    kit.stage.firstChild.append(this.tb.el);
    this.h = kit.stage.querySelector('.rc-h'); this.cap = kit.stage.querySelector('.rc-cap').style;
    this.root = kit.stage.firstChild;
  },
  render(t) {
    UI.frame(this.root, t, 7);
    kit.TextFx.fadeFromRight(this.h, t, 0.1);
    this.tb.render(t, 0.6);
    this.cap.opacity = eo(seg(t, 2.6, 3));
  },
});
