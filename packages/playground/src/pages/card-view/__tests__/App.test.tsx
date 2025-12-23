import { describe, it, expect } from 'vitest'
import { render } from '@lynx-js/react/testing-library'
import { App } from '../App.js'

describe('Card View Demo', () => {
  it('should render without crashing', () => {
    const { container } = render(<App />)
    expect(container).toBeTruthy()
  })

  it('should display the correct title', () => {
    const { getByText } = render(<App />)
    expect(getByText('Card View Demo')).toBeTruthy()
  })

  it('should display the subtitle', () => {
    const { getByText } = render(<App />)
    expect(getByText('Explore our featured products')).toBeTruthy()
  })

  it('should have a close button', () => {
    const { getByText } = render(<App />)
    expect(getByText('Close')).toBeTruthy()
  })

  it('should have a show last selection button', () => {
    const { getByText } = render(<App />)
    expect(getByText('Show Last Selection')).toBeTruthy()
  })
})
