import { spacing } from '@/constants/layout';

/**
 * 지도 페이지(WebView) 안에서 마커 HTML을 만드는 스크립트. build-kakao-map-html.ts가 <script> 안에 그대로 넣는다.
 * 지도 페이지가 길어져서 마커 모양(사진·묶음·핀·결과 표시)만 따로 뒀다. 브라우저에서 돌아 TypeScript 검사를 받지 못한다.
 * 쓰는 것: 페이지의 post(event). 내놓는 것: createElement, setPhoto, createMarkerElement, layOutMarkers
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

    // 사진·묶음 마커는 서버 좌표대로 놓으면 거의 같은 자리의 두 기록(QA: 내 기록 두 개)이 포개져서 위의 것만 눌린다.
    // 그래서 화면에서 포개진 마커끼리 모아 옆으로 벌려 놓는다. 화면 거리로 재므로 확대해서 저절로 떨어지면 원래 자리로 돌아온다.
    // 핀(고른 장소)과 결과 표시는 정확한 자리를 가리켜야 해서 옮기지 않는다.
    var spreadKinds = { photo: true, cluster: true };
    var spreadGap = ${spacing.xxs};

    function spreadOverlappingMarkers(entries) {
      var items = [];
      entries.forEach(function (entry) {
        if (!spreadKinds[entry.kind]) return;
        // 지난번에 벌려 둔 만큼을 지우고 원래 자리에서 다시 잰다.
        entry.element.style.transform = '';
        var rect = entry.element.querySelector('.photo, .stack').getBoundingClientRect();
        items.push({ entry: entry, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, size: Math.max(rect.width, rect.height) });
      });

      // 사진끼리 닿으면 한 무리로 묶는다. A와 B, B와 C가 닿으면 A·B·C를 함께 벌려야 다시 포개지지 않는다.
      var groupOf = items.map(function (_, index) { return index; });
      function findGroup(index) { return groupOf[index] === index ? index : (groupOf[index] = findGroup(groupOf[index])); }
      items.forEach(function (a, i) {
        items.forEach(function (b, j) {
          var reach = (a.size + b.size) / 2 + spreadGap;
          if (j > i && Math.abs(a.x - b.x) < reach && Math.abs(a.y - b.y) < reach) groupOf[findGroup(j)] = findGroup(i);
        });
      });
      var groups = {};
      items.forEach(function (item, index) { (groups[findGroup(index)] = groups[findGroup(index)] || []).push(item); });

      Object.keys(groups).forEach(function (key) {
        var group = groups[key];
        if (group.length < 2) return;
        // 왼쪽에 있던 사진이 계속 왼쪽에 오게 해서, 확대·축소할 때 사진끼리 자리가 뒤바뀌지 않게 한다.
        group.sort(function (a, b) { return (a.x - b.x) || (a.entry.order - b.entry.order); });
        var centerX = group.reduce(function (sum, item) { return sum + item.x; }, 0) / group.length;
        var centerY = group.reduce(function (sum, item) { return sum + item.y; }, 0) / group.length;
        var step = Math.max.apply(null, group.map(function (item) { return item.size; })) + spreadGap;
        // 두 장이면 나란히, 세 장 이상이면 이웃끼리 step만큼 떨어지도록 무리 가운데를 둘러 원으로 놓는다 (왼쪽부터 시계 방향).
        var ringRadius = group.length === 2 ? step / 2 : step / (2 * Math.sin(Math.PI / group.length));
        group.forEach(function (item, index) {
          var angle = Math.PI + (2 * Math.PI * index) / group.length;
          var dx = centerX + ringRadius * Math.cos(angle) - item.x;
          var dy = centerY + ringRadius * Math.sin(angle) - item.y;
          item.entry.element.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
        });
      });
    }

    // 사진을 먼저 벌린 뒤 벌린 자리로 이름표 겹침을 본다.
    function layOutMarkers(entries) {
      spreadOverlappingMarkers(entries);
      hideOverlappingLabels(entries);
    }
`;
