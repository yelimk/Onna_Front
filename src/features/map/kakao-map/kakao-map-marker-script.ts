/**
 * 지도 페이지(WebView) 안에서 마커 HTML을 만드는 스크립트. build-kakao-map-html.ts가 <script> 안에 그대로 넣는다.
 * 지도 페이지가 길어져서 마커 모양(사진·묶음·핀·결과 표시)만 따로 뒀다. 브라우저에서 돌아 TypeScript 검사를 받지 못한다.
 * 쓰는 것: 페이지의 post(event). 내놓는 것: createElement, setPhoto, createMarkerElement
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
      return root;
    }
`;
