const footer = document.getElementById('footer_template');
footer.innerHTML = `
<section id="footer-section">
  <!-- 상단: 로고 + 네비 -->
  <div class="footer-top">
    <div class="footer-logo">
      <img src="./img/logo-white.png" alt="">
    </div>
   
  </div>

  <!-- 본문: 왼쪽 기관정보 + 오른쪽 링크리스트 -->
  <div class="footer-main">
    <div class="footer-info">
      <p>  사이트명 : 서민채무조정안심센터 ㅣ 상호 : FLOS ㅣ 대표 : 최지웅 ㅣ 사업자등록번호 : 471-09-01112<br><br>

                        서민채무조정안심센터은 변호사 및 법무사(이하 ‘광고주’)와 소비자 간을 연결하는 플랫폼으로, 변호사법 및 기타 관련 법령을 준수하기 위해 이용자의 법률 상담, 사건 내용, 수임 여부 등에 일절 관여하지 않으며 광고주와 의뢰인 간의 모든 업무에 대한 법적 책임을 지지 않습니다. 또한 서민채무조정안심센터에 게시된 광고주 업체와 서민채무조정안심센터은 상호 간에 아무런 특별한 관계가 없음을 명확히 밝힙니다. 아울러 서민채무조정안심센터에 게재된 변호사·법무사의 정보는 당사가 직접 제공한 것으로, 이를 무단 복제·배포할 경우 관계 법령에 따라 처벌받을 수 있음을 알려드립니다.<br>
                        FLOS © All Rights Reserved.</a></p>
   

    </div>

  </div>

  <!-- 저작권 -->
  <div class="footer-copy">
    <small>Copyright © 2025 FLOS. All Rights Reserved.</small>
  </div>
</section>


	
`;

document.body.appendChild(footer.content);