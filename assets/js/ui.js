/* 回到顶端 —— 全站通用 */
(function () {
  function mount() {
    var b = document.createElement('button');
    b.className = 'to-top';
    b.type = 'button';
    b.setAttribute('aria-label', '回到顶端');
    b.innerHTML = '↑';
    document.body.appendChild(b);

    b.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    function update() {
      if (window.scrollY > 620) { b.classList.add('on'); }
      else { b.classList.remove('on'); }
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* 顶部满幅图视差 —— 序章 / 防风共用 */
  function parallax() {
    var img = document.querySelector('.prologue img');
    if (!img) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * -16;
      var y = (e.clientY / window.innerHeight - 0.5) * -12;
      img.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) scale(1.05)';
    }, { passive: true });
  }


  /* 第三层之后：全站页脚多一行 */
  function l3foot() {
    try {
      if (localStorage.getItem('aygy.layer3.done') !== '1') return;
    } catch (e) { return; }
    var f = document.querySelector('footer');
    if (!f || f.querySelector('.l3foot')) return;
    var p = document.createElement('p');
    p.className = 'l3foot';
    p.textContent = '城里的人走了。';
    p.style.cssText = 'margin:16px 0 0;font-size:11px;letter-spacing:.2em;color:rgba(255,180,94,.55)';
    f.appendChild(p);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ mount(); parallax(); l3foot(); });
  } else {
    mount();
    parallax();
    l3foot();
  }
})();
