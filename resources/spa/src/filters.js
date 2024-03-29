import plueMessageBundle from 'plus-message-bundle'
import { transTime } from '@/util'
import i18n from '@/i18n'
import xss from 'xss'

/**
 * ThinkSNS Plus 消息解析器，获取顶部消息.
 *
 * @param {Object} message
 * @param {String} defaultMessage
 * @return {String}
 * @author Seven Du <shiweidu@outlook.com>
 */
export function plusMessageFirst (message, defaultMessage) {
  return plueMessageBundle(message, defaultMessage).getMessage()
}

/**
 * 过滤 XSS
 *
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {string} value
 * @returns {string}
 */
export function escapeHTML (value) {
  const options = {}
  return xss(value, options)
}

/**
 * ThinkSNS Plus 消息解析器，获取顶部消息.
 *
 * @param {Object} message
 * @param {String} defaultMessage
 * @return {String}
 * @author Seven Du <shiweidu@outlook.com>
 */
export function plusMessageAnalyze (message, defaultMessage) {
  return plueMessageBundle(message, defaultMessage).getMessage()
}

/**
 * 格式化时间
 * @author jsonleex <jsonlseex@163.com>
 * @param  {Object} date
 * @param  {String} fmt
 * @return {String}
 */
export function formatDate (date, fmt = 'yyyy/MM/dd hh:mm') {
  date = new Date(date)
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds(),
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }
  return fmt
}

/**
 * 祖鲁时间和本地时间之间的时差 (单位:毫秒)
 * @returns {number} timezone offset
 */
export const timeOffset = new Date().getTimezoneOffset() * 60 * 1000
export const addTimeOffset = date => {
  date = new Date(date).getTime() - timeOffset
  return new Date(date).toLocaleString('chinese', { hour12: false })
}

export const time2tips = date => {
  if (typeof date === 'string') {
    date = transTime(date)
  }
  const time = new Date(date)
  const offset = (new Date().getTime() - time) / 1000
  if (offset < 60) return i18n.t('date.in_minute')
  if (offset < 3600) return i18n.t('date.minutes_ago', { min: ~~(offset / 60) })
  if (offset < 3600 * 24) return i18n.t('date.hours_ago', { hour: ~~(offset / 3600) })
  // 根据 time 获取到 "16:57"
  let timeStr, dateStr
  try {
    timeStr = time.toTimeString().match(/^\d{2}:\d{2}/)[0]
    dateStr = time
      .toLocaleDateString() // > "2018/10/19"
      .replace(/^\d{4}\/(\d{2})\/(\d{2})/, '$1-$2') // > 10-19
  } catch (e) {
    console.warn('time2tips error: ', { date, time }) // eslint-disable-line no-console
    return ''
  }
  if (offset < 3600 * 24 * 2) return i18n.t('date.yesterday', { time: timeStr })
  if (offset < 3600 * 24 * 9) return i18n.t('date.days_ago', { day: ~~(offset / 3600 / 24) })

  return dateStr
}

/**
 * 格式化数字
 *     @author jsonleex <jsonlseex@163.com>
 */
export const formatNum = (a = 0) => {
  return (
    a > 0 &&
      (a > 99999999 && (a = Math.floor(a / 1e8) + '亿'),
      a > 9999 &&
        (a =
          a > 99999999
            ? Math.floor(a / 1e8) + '亿'
            : Math.floor(a / 1e4) + '万')),
    a
  )
}

/**
 * Markdown to text fiter.
 *
 * @param {string} markdown
 * @return {string}
 * @author Seven Du <shiweidu@outlook.com>
 */
export function markdownText (markdown) {
  return require('./util/markdown').syntaxTextAndImage(markdown).text
}

/**
 * Internationization label
 *
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {String|String[]} params
 * @param {string} keypath
 * @returns
 */
export function t (params, keypath) {
  if (!keypath) return i18n.t(params)
  if (['string', 'number'].includes(typeof params)) params = [params]
  if (!(params instanceof Array)) return ''
  return i18n.t(keypath, params)
}

/**
 * 系统消息提示文字解析
 * @param {Object} data
 */
export function getNotificationDisplay (data) {
  switch (data.type) {
    case 'reward':
      return `${data.sender.name}打赏了你`
    case 'reward:feeds':
      return `${data.sender.name}打赏了你的动态`
    case 'reward:news':
      return `你的资讯《${data.news.title}》被${data.sender.name}打赏了${data.amount}${data.unit}`
    case 'group:join':
      return data.state === 'rejected'
        ? `拒绝用户加入圈子「${data.group.name}」`
        : `${data.user ? data.user.name : ''}请求加入圈子「${data.group.name}」`
    case 'user-certification':
      return data.state === 'rejected'
        ? `你申请的身份认证已被驳回，驳回理由：${data.contents}`
        : `你申请的身份认证已通过`
    case 'qa:answer-adoption':
    case 'question:answer':
      return `你提交的回答“${data.answer.body}”被采纳`
    case 'qa:reward':
      return `${data.sender.name}打赏了你的回答`
    case 'pinned:feed/comment':
      return data.state === 'rejected'
        ? `拒绝用户动态评论「${data.comment.contents}」的置顶请求`
        : `同意用户动态评论「${data.comment.contents}」的置顶请求`
    case 'pinned:news/comment':
      return data.state === 'rejected'
        ? `拒绝用户关于资讯《${data.news.title}》评论「${data.comment.contents}」的置顶请求`
        : `同意用户关于资讯《${data.news.title}》评论「${data.comment.contents}」的置顶请求`
    case 'group:comment-pinned':
    case 'group:send-comment-pinned':
      return data.state === 'rejected'
        ? `拒绝帖子「${data.post.title}」的评论置顶请求`
        : `同意帖子「${data.post.title}」的评论置顶请求`
    case 'group:post-pinned':
      return data.state === 'rejected'
        ? `拒绝用于帖子「${data.post.title}」的置顶请求`
        : `同意用于帖子「${data.post.title}」的置顶请求`
  }
}
