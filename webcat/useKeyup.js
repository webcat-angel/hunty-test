import { onUnmounted } from 'vue'
export default ({ key, shift, ctrl, alt }, action) => {
  const listener = (event) => {
    const { key: eventKey, shiftKey: eventShift, ctrlKey: eventCtrl, altKey: eventAlt } = event
    if (shift && !eventShift) return
    if (ctrl && !eventCtrl) return
    if (alt && !eventAlt) return
    if (eventKey === key) {
      try {
        action()
      } catch (e) {
        console.error(e)
      }
    }
  }
  window.addEventListener('keyup', listener)
  onUnmounted(() => window.removeEventListener('keyup', listener))
}