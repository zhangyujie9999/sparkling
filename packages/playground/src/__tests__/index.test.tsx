// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import '@testing-library/jest-dom'
import { expect, test, vi } from 'vitest'
import { render, getQueriesForElement } from '@lynx-js/react/testing-library'

import { App } from '../App.js'

test('App', async () => {
  const cb = vi.fn()

  render(
    <App
      onMounted={() => {
        cb(`__MAIN_THREAD__: ${__MAIN_THREAD__}`)
      }}
    />,
  )
  expect(cb).toBeCalledTimes(1)
  expect(cb.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "__MAIN_THREAD__: false",
      ],
    ]
  `)
  expect(elementTree.root).toMatchInlineSnapshot(`
    <page>
      <view>
        <view
          class="App"
        >
          <view
            class="Banner"
          >
            <view
              class="Logo"
            >
              <image
                class="Logo--lynx"
                src="/src/assets/sparkling_icon.png"
              />
            </view>
            <text
              class="Title"
            >
              TikTok Sparkling
            </text>
          </view>
          <view
            class="Content"
          >
            <view
              class="custom-list-container"
            >
              <list
                list-type="single"
                scroll-orientation="vertical"
                span-count="1"
                style="width: 100%; height: 200px;"
                update-list-info="[{"insertAction":[{"position":0,"type":"__Card__:__snapshot_5c8b8_test_3","item-key":"1"},{"position":1,"type":"__Card__:__snapshot_5c8b8_test_3","item-key":"2"},{"position":2,"type":"__Card__:__snapshot_5c8b8_test_3","item-key":"3"},{"position":3,"type":"__Card__:__snapshot_5c8b8_test_3","item-key":"4"}],"removeAction":[],"updateAction":[]}]"
              />
            </view>
            <view
              class="input-card-url"
            >
              <text
                class="bold-text"
              >
                Scheme
              </text>
              <input
                class="input-box"
                placeholder="Enter Scheme"
                text-color="#000000"
                value="hybrid://lynxview_page?bundle=second.lynx.bundle&title=Second Page&screen_orientation=portrait"
              />
            </view>
            <view
              class="expandable-list"
            >
              <view
                class="list-header"
              >
                <text>
                  Scheme Params 
                  <wrapper>
                    ▼
                  </wrapper>
                </text>
              </view>
              <wrapper />
            </view>
          </view>
        </view>
      </view>
    </page>
  `)
  const {
    findByText,
  } = getQueriesForElement(elementTree.root!)
  const element = await findByText('Scheme')
  expect(element).toBeInTheDocument()
  expect(element).toMatchInlineSnapshot(`
    <text
      class="bold-text"
    >
      Scheme
    </text>
  `)
})
