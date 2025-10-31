const footer = document.getElementById('footer_template');
footer.innerHTML = `
<section id="footer-section">
  <!-- 상단: 로고 + 네비 -->
  <div class="footer-top">
    <div class="footer-logo">
      <img src="./img/thel.png" alt="">
    </div>
   
  </div>

  <!-- 본문: 왼쪽 기관정보 + 오른쪽 링크리스트 -->
  <div class="footer-main">
    <div class="footer-info">
      <p>  사이트명 : 채무긴급대응 법률센터 ㅣ 상호 : 법무사무소 더엘 ㅣ 개인회생·파산 전문변호사 : 이우형 ㅣ 사업자등록번호 : 822-10-01825 <br>주소 : 서울시 서초구 서초대로60길 27, 4층(서초동, 경복빌딩) | 영업시간 : 평일 09:30~18:00 (야간 및 주말 상담 별도 문의) <br><br> 개인정보 및 광고책임변호사: 이우형 | Tel. 02-593-9191 | Fax. 02-593-1720 | E-mail. whlee@dllaw.co.kr<br><br>

                       <br>
                        법무사무소 더엘 © All Rights Reserved.</a></p>
   

    </div>

  </div>

  <!-- 저작권 -->
  <div class="footer-copy">
    <small>Copyright © 2025 FLOS. All Rights Reserved.</small>
  </div>
</section>


	
`;

document.body.appendChild(footer.content);