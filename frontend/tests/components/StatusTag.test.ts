// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import StatusTag from '@/components/common/StatusTag.vue'

describe('components/StatusTag：状态标签组件', () => {
  it('status=1 渲染为「启用」', () => {
    const wrapper = mount(StatusTag, { props: { status: 1 } })
    expect(wrapper.text()).toBe('启用')
    expect(wrapper.classes()).toContain('status-tag--ok')
  })

  it('status=0 渲染为「禁用」', () => {
    const wrapper = mount(StatusTag, { props: { status: 0 } })
    expect(wrapper.text()).toBe('禁用')
    expect(wrapper.classes()).toContain('status-tag--off')
  })
})
