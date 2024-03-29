import { $, _await } from '@/js/functions'
import Obj from '@/js/object'
import debounce from 'debounce'
import days from 'anim/days.json'
import hours from 'anim/hours.json'
import minutes from 'anim/minutes.json'
import seconds from 'anim/seconds.json'
const FIELDS = "days-Days/hours-Hours/minutes-Minutes/seconds-Seconds"
const START_DATE = "2023/1/25/9/15"


class CountDown {
  constructor({
    container,
    animations = {
      days,
      hours,
      minutes,
      seconds,
    },
    delays = {
      days: 0,
      hours: 99,
      minutes: 233,
      seconds: 399,
    },
    segments = {
      days: [40, 140],
      hours: [40, 110],
      minutes: [40, 110],
      seconds: [40, 100],
    },
  }) {
    this.container = typeof container === 'object' ? container : $.el(container)
    this.animations = animations
    this.delays = delays
    this.segments = segments
    this._createTimer()

  }

  _getFields() {
    const d = this.container.dataset.titles ? this.container.dataset.titles.split('/') : FIELDS.split('/')
    const startFields = {}
    d.forEach((f) => {
      const key = f.split('-')[0]
      const value = f.split('-')[1]
      startFields[key] = value
    })
    return startFields
  }

  _createTimer() {
    let date = this._calcStartValue()
    Object.keys(this._getFields()).forEach(async (key) => {
      this.container.insertAdjacentHTML('beforeEnd', this._renderField(key))
      const el = $.el(`.${key}`, this.container)
      new Obj({
        container: el,
        animation: this.animations[key],
        daley: this.delays[key],
        segment: this.segments[key],
      })
      await _await(this.delays[key] + 800)
      const elValue = $.el(`span[data-value="${key}"]`, this.container)
      const elField = $.el(`span[data-field="${key}"]`, this.container)
      this.#setFontSize(key)
      this.#addHendler(key)
      elValue.innerHTML = date[key]
      elField && (elField.innerHTML = this._getFields()[key])

    })

    const valueDay = $.el(`span[data-value="days"]`, this.container)
    const valueHours = $.el(`span[data-value="hours"]`, this.container)
    const valueMinutes = $.el(`span[data-value="minutes"]`, this.container)
    const valueSeconds = $.el(`span[data-value="seconds"]`, this.container)

    setInterval(() => {
      let date = this._calcStartValue()
      valueDay && (valueDay.innerHTML = date.days)
      valueHours && (valueHours.innerHTML = date.hours)
      valueMinutes && (valueMinutes.innerHTML = date.minutes)
      valueSeconds && (valueSeconds.innerHTML = date.seconds)
    }, 1000)
  }

  _renderField(title) {
    return `
        <div class="filed ${title}" data-${title}="${title}">
            <div class="cont">
                <span class="value" data-value="${title}"></span>
                <span class="title" data-field="${title}"></span>
            </div>
        </div> 
        `
  }

  _calcStartValue() {

    const realDate = this.container.dataset.date ? this.container.dataset.date.split('/') : START_DATE.split('/')

    for (let i = 0;i <= 5;i++) {
      i === 1 && realDate[i]--
      !realDate[i] && (realDate[i] = 0)
    }

    let date = new Date(...realDate)

    const period = date.getTime() - new Date().getTime()

    date = {
      days: Math.floor(period / (24 * 60 * 60 * 1000)) >= 0 ? Math.floor(period / (24 * 60 * 60 * 1000)) : 0,
      hours: Math.floor(period / (60 * 60 * 1000)) % 24 >= 0 ? Math.floor(period / (60 * 60 * 1000)) % 24 : 0,
      minutes: Math.floor(period / (60 * 1000)) % 60 >= 0 ? Math.floor(period / (60 * 1000)) % 60 : 0,
      seconds: Math.floor(period / 1000) % 60 >= 0 ? Math.floor(period / 1000) % 60 : 0,
    }

    return date
  }
  #addHendler(key) {
    window.addEventListener('resize', debounce(() => {
      this.#setFontSize(key)
    }, 10))
  }
  #setFontSize(key) {
    const elValue = $.el(`span[data-value="${key}"]`, this.container)
    const elField = $.el(`span[data-field="${key}"]`, this.container)
    const fsValue = elValue.offsetWidth * 1.5
    const fsField = elField.offsetWidth * 0.5
    elValue.style.fontSize = `${fsValue}%`
    elField.style.fontSize = `${fsField}%`
   
  }
}

function check(date) {
  let flag = true

  for (const key in date) {
    if (Object.hasOwnProperty.call(date, key)) {
      const el = date[key]
      if (el == 0 && flag) {
        delete date[key]
      } else {
        flag = false
      }
    }
  }

  return date
}

export default CountDown
