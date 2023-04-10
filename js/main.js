
$(function () {

  /**
   * util
   */

  function debounce(func, wait, immediate) {
    var timeout
    return function () {
      var context = this
      var args = arguments
      var later = function () {
        timeout = null
        if (!immediate) func.apply(context, args)
      }
      var callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func.apply(context, args)
    }
  };

  function throttle(func, wait, mustRun) {
    var timeout
    var startTime = new Date()

    return function () {
      var context = this
      var args = arguments
      var curTime = new Date()

      clearTimeout(timeout)
      if (curTime - startTime >= mustRun) {
        func.apply(context, args)
        startTime = curTime
      } else {
        timeout = setTimeout(func, wait)
      }
    }
  };

  function getEleTop(ele) {
    let actualTop = ele.offsetTop
    let current = ele.offsetParent

    while (current !== null) {
      actualTop += current.offsetTop
      current = current.offsetParent
    }

    return actualTop
  }

  function scrollToDest(pos, time = 500){
    const currentPos = window.pageYOffset
    const isNavFixed = document.getElementById('navbar').classList.contains('navbar-fixed-top')
    if (currentPos > pos || isNavFixed) pos = pos - 70

    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: pos,
        behavior: 'smooth'
      })
      return
    }

    let start = null
    pos = +pos
    window.requestAnimationFrame(function step(currentTime) {
      start = !start ? currentTime : start
      const progress = currentTime - start
      if (currentPos < pos) {
        window.scrollTo(0, ((pos - currentPos) * progress / time) + currentPos)
      } else {
        window.scrollTo(0, currentPos - ((currentPos - pos) * progress / time))
      }
      if (progress < time) {
        window.requestAnimationFrame(step)
      } else {
        window.scrollTo(0, pos)
      }
    })
  }

  // function updateAnchor(anchor){
  //   if (anchor !== window.location.hash) {
  //     if (!anchor) anchor = location.pathname
  //     const title = GLOBAL_CONFIG_SITE.title
  //     window.history.replaceState({
  //       url: location.href,
  //       title
  //     }, title, anchor)
  //   }
  // }

  /**
   *  layout init
   */

  function toggleBtnClick() {
    var toggleBtn = $('.toggle-btn')
    var sidebarContent = $('#sidebar-content')
    var sidebarMask = $('#sidebar-mask')
    var body = $('body')
    function toggleSidebar(close) {
      var isOpen = sidebarContent.hasClass('sidebar-open')
      if (close != '' && close != undefined) {
        isOpen = close == '1'
      }
      if (isOpen) {
        sidebarContent.removeClass('sidebar-open')
        sidebarMask.addClass('hidden')
        body.removeClass('hidden-scroll')
      } else {
        sidebarContent.addClass('sidebar-open')
        sidebarMask.removeClass('hidden')
        body.addClass('hidden-scroll')
      }
    }
    toggleBtn.click(function () {
      toggleSidebar()
    })
    sidebarMask.click(function () {
      toggleSidebar()
    })

    window.addEventListener('resize', () => {
      $('.toggle-btn').css('display') == 'none' && toggleSidebar('1')
    })

  }

  toggleBtnClick()

  var initTop = 0

  function isUpScroll(currentTop) {
    var res = currentTop > initTop
    initTop = currentTop
    return res
  }

  function navbarScroll() {
    $(window).scroll(throttle(function (e) {
      var currentTop = $(this).scrollTop()
      var isUp = isUpScroll(currentTop)

      if (currentTop > 76) {
        if (isUp) {
          if ($('#navbar').hasClass('navbar-blur'))
            $('#navbar').removeClass('navbar-blur')
        } else {
         if (!$('#navbar').hasClass('navbar-blur'))
            $('#navbar').addClass('navbar-blur')
        }
        $('#navbar').addClass('navbar-fixed-top')
      } else {
        if (currentTop == 0) {
          $('#navbar').removeClass('navbar-fixed-top').removeClass('navbar-blur')
        }
      }
    }, 50, 100))
  }

  navbarScroll()


  /**
  * toc,anchor
  */
  const scrollFnToDo = function () {
    const isToc = true
    const $article = document.getElementById('post-content')

    if (!($article)) return

    let $tocLink, $cardToc, autoScrollToc, $tocPercentage, isExpand

    if (isToc) {
      const $cardTocLayout = document.getElementById('catelog-container')
      console.log($cardTocLayout);
      $cardToc = $cardTocLayout.getElementsByClassName('aside-catalog')[0]
      console.log($cardToc);
      $tocLink = $cardToc.querySelectorAll('.toc-link')
      $tocPercentage = $cardTocLayout.querySelector('.toc-percentage')
      isExpand = $cardToc.classList.contains('is-expand')

      window.mobileToc = {
        open: () => {
          $cardTocLayout.style.cssText = 'animation: toc-open .3s; opacity: 1; right: 55px'
        },

        close: () => {
          $cardTocLayout.style.animation = 'toc-close .2s'
          setTimeout(() => {
            $cardTocLayout.style.cssText = "opacity:''; animation: ''; right: ''"
          }, 100)
        }
      }

      // toc元素點擊
      $cardToc.addEventListener('click', e => {
        e.preventDefault()
        const target = e.target.classList
        if (target.contains('aside-catalog')) return
        const $target = target.contains('toc-link')
          ? e.target
          : e.target.parentElement
        scrollToDest(getEleTop(document.getElementById(decodeURI($target.getAttribute('href')).replace('#', ''))), 300)
        if (window.innerWidth < 900) {
          window.mobileToc.close()
        }
      })

      autoScrollToc = item => {
        const activePosition = item.getBoundingClientRect().top
        const sidebarScrollTop = $cardToc.scrollTop
        if (activePosition > (document.documentElement.clientHeight - 100)) {
          $cardToc.scrollTop = sidebarScrollTop + 150
        }
        if (activePosition < 100) {
          $cardToc.scrollTop = sidebarScrollTop - 150
        }
      }
    }

    // find head position & add active class
    const list = $article.querySelectorAll('h1,h2,h3,h4,h5,h6')
    let detectItem = ''
    const findHeadPosition = function (top) {
      if (top === 0) {
        return false
      }

      let currentId = ''
      let currentIndex = ''

      list.forEach(function (ele, index) {
        if (top > getEleTop(ele) - 80) {
          const id = ele.id
          currentId = id ? '#' + encodeURI(id) : ''
          currentIndex = index
        }
      })

      if (detectItem === currentIndex) return

      // if (isAnchor) btf.updateAnchor(currentId)

      detectItem = currentIndex

      if (isToc) {
        $cardToc.querySelectorAll('.active').forEach(i => { i.classList.remove('active') })

        if (currentId === '') {
          return
        }

        const currentActive = $tocLink[currentIndex]
        currentActive.classList.add('active')

        setTimeout(() => {
          autoScrollToc(currentActive)
        }, 0)

        if (isExpand) return
        let parent = currentActive.parentNode

        for (; !parent.matches('.toc'); parent = parent.parentNode) {
          if (parent.matches('li')) parent.classList.add('active')
        }
      }
    }

    // main of scroll
    window.tocScrollFn = throttle(() => {
      const currentTop = window.scrollY || document.documentElement.scrollTop
      findHeadPosition(currentTop)
    }, 100)

    window.addEventListener('scroll', tocScrollFn)
  }

  scrollFnToDo()
})


