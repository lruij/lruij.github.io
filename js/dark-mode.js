//黑夜模式判断
$(function () {
  darkMode()
})

function darkMode() {
  let isDark = localStorage.getItem('isDark') === '1'
  let root = document.documentElement;
  if (isDark) {
    root.setAttribute('data-theme', 'dark')

  } else {
    root.setAttribute('data-theme', 'light')
    $('#sum-moon-icon').text('dark_mode')
  }
}
