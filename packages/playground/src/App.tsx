import { useCallback, useEffect, useState } from '@lynx-js/react'
import SwitchButton from './components/SwitchButton.js';

import './App.css'
import sparklingLogo from './assets/sparkling_icon.png';
import type { NavigateResponse } from 'sparkling-router';
import * as router from 'sparkling-router';
import * as storage from 'sparkling-storage';
import type { InputEvent } from './typing.js';

export function App(props: {
  onMounted?: () => void
}) {

  const [bundlePath, setBundlePath] = useState('second.lynx.bundle');
  const [switchStates, setSwitchStates] = useState<Record<string, boolean>>({ hide_nav_bar: false, hide_status_bar: false, trans_status_bar: false, hide_loading: false, hide_error: false });
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [apiResponse, setApiResponse] = useState<string>('TikTok Sparkling');

  useEffect(() => {
    console.info('Hello, ReactLynx')
    props.onMounted?.()
  }, [])

  const handleInput = (event: InputEvent) => {
    'background only';
    const currentValue = event.detail.value.trim();
    setBundlePath(currentValue);
  };

  const handleSwitchChange = useCallback((key: string, checked: boolean) => {
    setSwitchStates(prev => ({ ...prev, [key]: checked }));
  }, []);

  const buildQueryParams = useCallback(() => {
    const params: Record<string, string> = {};
    Object.entries(switchStates).forEach(([key, value]) => {
      if (value) {
        params[key] = '1';
      }
    });
    return params;
  }, [switchStates]);

  const routerOpen = () => {
    router.navigate(
      {
        path: bundlePath,
        options: {
          params: buildQueryParams(),
        },
      },
      (v: NavigateResponse) => {
        console.log('v', v);
        setApiResponse(`Router Navigate: ${JSON.stringify(v)}`);
      }
    );
  };

  const setStorageItem = () => {
    storage.setItem({
      key: 'key',
      data: {
        name: 'Vagrant',
        producer: 'Feint',
        time: 2015
      },
    }, (v: storage.SetItemResponse) => {
      console.log('v', v);
      setApiResponse(`Set Storage: ${JSON.stringify(v)}`);
    });
  };

  const getStorageItem = () => {
    storage.getItem({
      key: 'key'
    }, (v: storage.GetItemResponse) => {
      console.log('v', v);
      setApiResponse(`Get Storage: ${JSON.stringify(v)}`);
    });
  };

  const openCardView = () => {
    router.navigate(
      {
        path: 'card-view.lynx.bundle',
        options: { params: { title: 'Card View Demo', screen_orientation: 'portrait' } },
      },
      (v: router.NavigateResponse) => {
        console.log('Card view opened:', v);
        setApiResponse(`Card View Opened: ${JSON.stringify(v)}`);
      }
    );
  };

  const listItems = [
    { id: 1, title: 'open', api: routerOpen},
    { id: 2, title: 'setStorage', api: setStorageItem},
    { id: 3, title: 'getStorage', api: getStorageItem },
    { id: 4, title: 'cardView', api: openCardView },
  ];

  return (
    <view>
      <view className='App'>
        <view className='Banner'>
          <view className='Logo' >
            <image src={sparklingLogo} className='Logo--lynx' />
          </view>
          <text className='Title'>TikTok Sparkling</text>
        </view>
        <view className='Content'>
          <view className='custom-list-container'>
            <list
              style={{ width: '100%', height: '200px' }}
              list-type='single'
              span-count={1}
              scroll-orientation='vertical'
            >
              {listItems.map((item, index) => (
                <list-item
                  key={item.id}
                  item-key={item.id.toString()}
                  style={{ padding: '10px' }}
                >
                  <view
                    className='custom-button'
                    bindtap={() => item.api()}
                  >
                    <text style={{ color: '#ffffff' }}>{item.title}</text>
                  </view>
                </list-item>
              ))}
            </list>
          </view>
          <view className='input-card-url'>
            <text className='bold-text'>Bundle Path</text>
            <input
              className="input-box"
              bindinput={handleInput}
              placeholder="Enter bundle path (e.g. second.lynx.bundle)"
              value={bundlePath}
              text-color='#000000'
            />
          </view>
          <view className='expandable-list'>
            <view className='list-header' bindtap={() => setIsListExpanded(!isListExpanded)}>
              <text>Route Params {isListExpanded ? '▲' : '▼'}</text>
            </view>
            {isListExpanded && (
              <list
                style={{ width: '100%', height: '200px' }}
                list-type='single'
                span-count={1}
                scroll-orientation='vertical'
              >
                {Object.entries(switchStates).map(([key, value]) => (
                  <list-item
                    key={key}
                    item-key={key}
                    style={{ width: '200px', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '10px', alignSelf: 'flex-start', display: 'flex' }}
                  >
                    <text>{key}</text>
                    <SwitchButton
                      checked={value}
                      onChange={(e) => handleSwitchChange(key, e)}
                    />
                  </list-item>
                ))}
              </list>
            )}
          </view>
        </view>
      </view>
    </view>
  )
}
