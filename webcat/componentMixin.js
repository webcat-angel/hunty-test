import { set, get } from 'lodash-es'
export default {
  computed: {
    $scope () {
      return {
        $set: (key, value) => {
          console.log(this)
          set(this, key, value)
        },
        $toggle: (key) => {
          console.log(this)
          set(this, key, !get(this, key))
        }
      }
    }
  }
}