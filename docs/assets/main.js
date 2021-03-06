hljs.initHighlightingOnLoad();

function showOverlay(overlay, time) {
  overlay.classList.add('active');
  if (time > 0)
    overlay.timeout = setTimeout(function(){ hideOverlay(overlay); }, time);
}

function hideOverlay(overlay, options) {
  clearTimeout(overlay.timeout);
  if (!options || options.propagate !== false)
    overlay.dispatchEvent(new CustomEvent('overlay-closed'));
  overlay.classList.remove('active');
}

//
// a minor polyfill
//
if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {
        thisArg = thisArg || window;
        for (var i = 0; i < this.length; i++) {
            callback.call(thisArg, this[i], i, this);
        }
    };
}

window.addEventListener('load', function() {
  var copyConfirm = document.getElementById('copy-confirm');

  //
  // copy whole code (like install instructions)
  //
  new ClipboardJS('pre[copy] code', {
      text: function(trigger) {
        showOverlay(copyConfirm, 2000);
        return trigger.textContent;
      }
  });

  document.querySelectorAll('.overlay').forEach(function(node) {
    node.addEventListener('click', function(){hideOverlay(node)});
  });


  //
  // break javascript code into distinct lines
  // make each line copiable
  //
  document.querySelectorAll('pre:not([copy]) code').forEach(function(node) {
    var lines = node.innerHTML.split('\n');
    var marker = '<span class="hljs-comment">/*!*/</span>';
    node.innerHTML = '';
    node.classList.add('processed');
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].replace(/=\&gt\;/g, '<span class="func-arrow">=&gt;</span>');
      var ctr = '<span line-counter ' + 
              (((i + 1)%5==0 || (i == 0) || (i == lines.length - 1)?'class="prim"':'')) 
              + '>' + (i + 1) + '</span>';
      if (line.trim().length > 0) {
        if (line.startsWith(marker)) {
          var content = line.substr(marker.length);
          if (content.trim().length == 0)
            node.innerHTML += '<div class="line highlight">' + ctr + '<br></div>';
          else
            node.innerHTML += '<div class="line highlight">' + ctr + line.substr(marker.length) + '</div>';
        }
        else
          node.innerHTML += '<div class="line">' + ctr + line + '</div>';
      }
      else node.innerHTML += '<div class="line">' + ctr + '<br></div>';
    }
  });

  new ClipboardJS('code .line', {
      text: function(trigger) {
        showOverlay(copyConfirm, 2000);
        var clone = trigger.cloneNode(true);
        clone.childNodes[0].remove();
        return clone.textContent;
      }
  });

  //
  // also add copy buttons to all triable codes:
  //
  document.querySelectorAll('pre[try]').forEach(function(node) {
    var holder = document.createElement('div');
    holder.setAttribute('class', 'buttons');

    var copyBtn = document.createElement('button');
    copyBtn.innerHTML = '<img src="/docs/assets/copy.svg"/><img src="/docs/assets/copy-blue.svg"/>';
    copyBtn.setAttribute('class', 'copy-btn');
    holder.appendChild(copyBtn);

    var tryBtn = document.createElement('a');
    tryBtn.setAttribute('class', 'button');
    tryBtn.setAttribute('href', node.getAttribute('try'));
    tryBtn.setAttribute('target', '_blank');
    tryBtn.innerHTML = 'TRY IT!'
    holder.appendChild(tryBtn);

    node.parentNode.insertBefore(holder, node.nextSibling);

    if (node.hasAttribute('preview')) {
      var prevholder = document.createElement('div');
      prevholder.setAttribute('class', 'pre-holder');

      var prevholderC = document.createElement('div');
      prevholderC.setAttribute('class', 'code-holder');

      var prevholderP = document.createElement('div');
      prevholderP.setAttribute('class', 'preview-holder');

      var preview = document.createElement('iframe');
      preview.setAttribute('class', 'preview');
      preview.setAttribute('src', node.getAttribute('preview'));

      prevholderC.appendChild(node);
      prevholderP.appendChild(preview);
      prevholder.appendChild(prevholderC);
      prevholder.appendChild(prevholderP);

      holder.parentNode.insertBefore(prevholder, holder);
    }
  });

  new ClipboardJS('pre[try] + .buttons .copy-btn', {
    text: function(trigger) {
      showOverlay(copyConfirm, 2000);
      let code = '';
      let lines = trigger.parentElement.previousElementSibling.querySelector('code').childNodes;
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].cloneNode(true);
        line.childNodes[0].remove();
        code += line.textContent + '\n';
      }

      return code;
    }
  });

  //
  // make the links of titles copiable
  //
  new ClipboardJS('h1[id], h2[id], h3[id]', {
    text: function(trigger) {
      showOverlay(copyConfirm, 2000);
      return location.protocol+'//'+location.host+location.pathname+'#'+trigger.getAttribute('id');
    }
  });

  //
  // make the toc
  //
  var div = document.createElement('div');
  var titles = document.querySelectorAll('h1[id], h2[id], h3[id]:not([skip-toc])');
  var tocels = {};
  titles.forEach(function(node) {
    var a = document.createElement('a');
    a.setAttribute('href', location.protocol+'//'+location.host+location.pathname+'#'+node.getAttribute('id'));
    a.textContent = node.textContent;
    a.classList.add(node.tagName.toLowerCase());
    tocels[node.getAttribute('id')] = a;
    div.appendChild(a);
    div.appendChild(document.createElement('br'));
  });
  document.getElementById('toc').appendChild(div);
  window.addEventListener('scroll', function() {
    var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    var current = undefined;
    titles.forEach(function(node) { if (node.offsetTop <= scrollTop + window.innerHeight) current = node; });
    titles.forEach(function(node) {
      var tocel = tocels[node.getAttribute('id')];
      if ((node.offsetTop >= scrollTop &&
        node.offsetTop <= scrollTop + window.innerHeight) || node == current)
        tocel.classList.add('visible');
      else
        tocel.classList.remove('visible');
    });
  });

  //
  // make tabs
  //
  (function() {
    var tabs = document.querySelectorAll('[tabs]');
    tabs.forEach(function(holder) {
      var buttons = document.createElement('div');
      buttons.classList.add('tab-toggles');
      holder.querySelectorAll('[tab]').forEach(function(tab) {
        var button = document.createElement('button');
        button.innerHTML = tab.getAttribute('tab');
        buttons.appendChild(button);
        button.addEventListener('click', function() {
          buttons.querySelectorAll('button').forEach(function(btn) { btn.classList.remove('active'); });
          holder.querySelectorAll('[tab]').forEach(function(tab) { tab.classList.remove('active'); });
          button.classList.add('active');
          tab.classList.add('active');
        });
      });

      holder.firstElementChild.classList.add('active');
      buttons.firstElementChild.classList.add('active');
      holder.parentElement.insertBefore(buttons, holder);
    });
  })();

  //
  // dark mode
  //
  (function() {
    var dmtoggle = document.getElementById('dmtoggle');
    var body = document.body;

    var darkMode = function() { body.classList.add('dark-mode');  }
    var lightMode = function() { body.classList.remove('dark-mode'); }

    var systemPref = undefined;

    var localPrefDark = function() {
      if (systemPref == 'dark') localStorage.setItem('pref-scheme', 'system');
      else localStorage.setItem('pref-scheme', 'dark');
      setByLocalOrSystem();
    }

    var localPrefLight = function() {
      if (systemPref == 'light') localStorage.setItem('pref-scheme', 'system');
      else localStorage.setItem('pref-scheme', 'light');
      setByLocalOrSystem();
    }

    var systemPrefDark = function() { systemPref = 'dark'; setByLocalOrSystem(); }
    var systemPrefLight = function() {  systemPref = 'light'; setByLocalOrSystem(); }

    var setByLocalOrSystem = function() {
      let localPref = localStorage.getItem('pref-scheme');
      if (localPref && localPref !== 'system') {
        if (localPref == 'dark') darkMode();
        if (localPref == 'light') lightMode();
      }
      else if (systemPref) {
        if (systemPref == 'dark') darkMode();
        if (systemPref == 'light') lightMode();
      }
    }

    dmtoggle.addEventListener('click', function() {
      if (body.classList.contains('dark-mode')) localPrefLight();
      else localPrefDark();
    });

    if (window.matchMedia) {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) systemPrefDark();
      window.matchMedia('(prefers-color-scheme: dark)').addListener(function(q) { if (q.matches) systemPrefDark(); });

      if (window.matchMedia('(prefers-color-scheme: light)').matches) systemPrefLight();
      window.matchMedia('(prefers-color-scheme: light)').addListener(function(q) { if (q.matches) systemPrefLight(); });
    }

    setByLocalOrSystem();

    setTimeout(function() { body.classList.add('dark-mode-animate')}, 100);
  })();

  //
  // nav toggle
  //
  var navtoggle = document.getElementById('navtoggle');
  var nav = document.getElementById('nav');
  navtoggle.addEventListener('click', function() {
    if (navtoggle.classList.contains('active')) {
      navtoggle.classList.remove('active');
      nav.classList.remove('active');
    }
    else {
      navtoggle.classList.add('active');
      nav.classList.add('active');
    }
  });

  //
  // nav prev/next
  //
  var navlinks = document.querySelectorAll('#nav a');
  var prevnext = document.getElementById('prevnext');
  if (prevnext) {
    (function() {
      var prev = document.getElementById('prev');
      var next = document.getElementById('next');

      navlinks.forEach(function(node, index, list) {
        if (node.getAttribute('href') == location.pathname) {
          if (index > 0) {
            var preva = list[index - 1];
            prev.innerHTML = '<a href="' + preva.getAttribute('href') + '">' + preva.textContent + '</a>';
            prev.classList.add('active');
            prev.addEventListener('click', function() {
              preva.click();
            });
          }

          if (index < list.length - 1) {
            var nexta = list[index + 1];
            next.innerHTML = '<a href="' + nexta.getAttribute('href') + '">' + nexta.textContent + '</a>';
            next.classList.add('active');
            next.addEventListener('click', function() {
              nexta.click();
            });
          }
        }
      });
    })();
  }

  //
  // nav search
  //
  (function() {
    var navsearchicon = document.getElementById('navsearchicon');

    var ajax = rxjs.ajax.ajax;
    var debounceTime = rxjs.operators.debounceTime;
    var fromEvent = rxjs.fromEvent;
    var wrap = connective.wrap;
    var pipe = connective.pipe;
    var map = connective.map;
    var filter = connective.filter;
    var value = connective.value;

    var res = connective.pin();
    var inp = document.getElementById('navsearch');
    var cache = {};

    var url = 'https://api.github.com/search/code?';
    var params = '+in:file+path:docs/templates+extension:njk+repo:CONNECT-platform/connective';

    var q = wrap(fromEvent(inp, 'input'))
    .to(map(function() {
      navsearchicon.classList.add('loading');
      return inp.value;
    }))
    .to(pipe(debounceTime(1000)));

    q.to(filter(function(q) { return q == ''; })).to(value('no-search')).to(res);
    q.to(filter(function(q) { return q.length > 0}))
      .to(map(function(q, done, error) {
        if (cache[q]) done(cache[q]);
        else {
          ajax.getJSON(url + 'q=' + encodeURIComponent(q) + params)
            .subscribe(
              function(resp) { cache[q] = resp; done(resp); },
              function(err) { error(err); }
            );
        }
      }))
      .to(map(function(res) {
        console.log(res);
        var list = [];
        var items = res.items || [];
        for (var i = 0; i < items.length; i++) {
          var path = items[i].path;
          list.push('/' + path.substr(0, path.length - 4).replace('/templates', ''));
        }

        return list;
      }))
      .to(res);

    res.subscribe(function(list) {
      navsearchicon.classList.remove('loading');
      navlinks.forEach(function(node) {
        if (list == 'no-search') {
          node.classList.remove('highlight');
          node.classList.remove('faded');
        }
        else {
          if (list.indexOf(node.getAttribute('href')) != -1) {
            node.classList.add('highlight');
            node.classList.remove('faded');
          }
          else {
            node.classList.remove('highlight');
            node.classList.add('faded');
          }
        }
      });
    });
  })();

  //
  // gitter stuff
  //
  (function() {
    var gitterChat = window.gitter.chat.defaultChat;
    var chatElement = document.querySelector('.gitter-chat-embed');
    var gitterOverlay = document.getElementById('gitter-overlay');

    chatElement.addEventListener('gitter-chat-toggle', function (event) {
      if (event.detail.state)
        showOverlay(gitterOverlay);
      else hideOverlay(gitterOverlay, { propagate: false });
    });

    gitterOverlay.addEventListener('overlay-closed', function() {
      gitterChat.toggleChat();
    });

    var link = document.querySelector('.gitter-chat-embed-action-bar-item-pop-out');
    link.textContent = 'open in GITTER';
    link.classList.add('no-underline');
  })();
});
