/**
 * 지도 페이지(WebView) 안에서 마커 HTML을 만드는 스크립트. build-kakao-map-html.ts가 <script> 안에 그대로 넣는다.
 * 지도 페이지가 길어져서 마커 모양(사진·묶음·핀·결과 표시)만 따로 뒀다. 브라우저에서 돌아 TypeScript 검사를 받지 못한다.
 * 쓰는 것: 페이지의 post(event). 내놓는 것: createElement, setPhoto, createMarkerElement, hideOverlappingLabels
 */
export const markerScript = `
    // 해시태그는 사용자가 쓴 글이라 innerHTML 대신 textContent로 넣는다.
    function createElement(tag, className, text) {
      var element = document.createElement(tag);
      element.className = className;
      if (text) element.textContent = text;
      return element;
    }

    // 서버 사진 주소를 배경으로 깐다. 주소가 없으면 CSS의 회색 가림이 그대로 보인다.
    function setPhoto(element, imageUrl) {
      // 서명이 붙은 주소라 다시 인코딩하면 깨진다. CSS 문자열을 끝내 버리는 따옴표·역슬래시만 바꾼다.
      if (imageUrl) element.style.backgroundImage = 'url("' + imageUrl.replace(/["\\\\]/g, encodeURIComponent) + '")';
      return element;
    }

    function createMarkerElement(marker) {
      var root = createElement('button', 'marker');
      if (marker.kind === 'result') {
        root.appendChild(createElement('div', 'result'));
      } else if (marker.kind === 'pin') {
        if (marker.label) root.appendChild(createElement('span', 'pin-label', marker.label));
        var pin = createElement('div', 'pin');
        pin.appendChild(createElement('div', 'pin-dot'));
        root.appendChild(pin);
      } else if (marker.kind === 'cluster') {
        var stack = createElement('div', 'stack');
        var imageUrls = marker.imageUrls || [];
        // 맨 앞(stack-front)에 첫 대표 사진이 오도록 뒤에서부터 채운다.
        ['stack-back', 'stack-middle', 'stack-front'].forEach(function (position, index) {
          stack.appendChild(setPhoto(createElement('div', 'photo photo-locked ' + position), imageUrls[2 - index]));
        });
        if (marker.isSelected) {
          // 이미 열어 본 묶음은 Figma처럼 이름표 없이 주황 원으로만 감싼다.
          var ring = createElement('div', 'selected-ring');
          ring.appendChild(stack);
          root.appendChild(ring);
        } else {
          root.appendChild(stack);
          root.appendChild(createElement('span', 'cluster-label', marker.label));
          root.appendChild(createElement('span', 'cluster-more', '+' + marker.moreCount + '개 더'));
        }
      } else {
        root.appendChild(setPhoto(createElement('div', 'photo ' + (marker.isOpen ? 'photo-open' : 'photo-locked')), marker.imageUrl));
        root.appendChild(createElement('span', 'chip ' + (marker.isOpen ? 'chip-dark' : 'chip-light'), marker.hashtags[0]));
      }
      root.addEventListener('click', function () {
        post({ type: 'markerPress', kind: marker.kind, markerId: marker.id });
      });
      // 누르고 있는 동안 흐리게 해서 눌렸다는 걸 보여준다. 손을 떼거나 지도를 끌기 시작하면 바로 되돌린다.
      function release() { root.classList.remove('marker-pressed'); }
      root.addEventListener('touchstart', function () { root.classList.add('marker-pressed'); }, { passive: true });
      root.addEventListener('touchmove', release, { passive: true });
      root.addEventListener('touchend', release);
      root.addEventListener('touchcancel', release);
      return root;
    }

    // 이름표를 먼저 보여줄 순서. 고른 장소 핀이 가장 중요하고, 묶음(여러 기록)이 사진 한 장보다 먼저다.
    var labelPriority = { pin: 0, cluster: 1, photo: 2, result: 3 };

    function overlaps(a, b) {
      return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    }

    // 마커끼리 가까우면 해시태그 이름표가 다른 마커의 사진·이름표를 덮어 읽을 수 없다.
    // 사진은 모두 두고, 이름표는 중요한 순서대로 놓다가 이미 놓인 것과 겹치면 숨긴다. 확대하면 떨어져서 다시 보인다.
    function hideOverlappingLabels(entries) {
      var labelSelector = '.chip, .cluster-label, .cluster-more, .pin-label';
      var placed = [];
      entries.forEach(function (entry) {
        entry.element.querySelectorAll(labelSelector).forEach(function (label) { label.classList.remove('label-hidden'); });
        var photo = entry.element.querySelector('.photo, .stack, .pin, .result');
        if (photo) placed.push({ owner: entry, rect: photo.getBoundingClientRect() });
      });
      entries
        .slice()
        .sort(function (a, b) { return (labelPriority[a.kind] - labelPriority[b.kind]) || (a.order - b.order); })
        .forEach(function (entry) {
          var labels = entry.element.querySelectorAll(labelSelector);
          var rects = Array.prototype.map.call(labels, function (label) { return label.getBoundingClientRect(); });
          var isBlocked = rects.some(function (rect) {
            return placed.some(function (other) { return other.owner !== entry && overlaps(rect, other.rect); });
          });
          if (isBlocked) {
            labels.forEach(function (label) { label.classList.add('label-hidden'); });
            return;
          }
          rects.forEach(function (rect) { placed.push({ owner: entry, rect: rect }); });
        });
    }
`;
