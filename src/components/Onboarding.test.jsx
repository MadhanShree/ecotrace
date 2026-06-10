import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Onboarding from './Onboarding.jsx'

describe('<Onboarding />', () => {
  it('renders the first step (transport)', () => {
    render(<Onboarding onComplete={() => {}} />)
    expect(screen.getByText(/How do you get around/i)).toBeInTheDocument()
  })

  it('shows step 1 of 4 progress', () => {
    render(<Onboarding onComplete={() => {}} />)
    expect(screen.getByText(/Step 1 of 4/i)).toBeInTheDocument()
  })

  it('advances to the diet step when Next is clicked', () => {
    render(<Onboarding onComplete={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /Next/i }))
    expect(screen.getByText(/What does your plate look like/i)).toBeInTheDocument()
  })

  it('pre-fills from an initial profile', () => {
    const initial = { carFuel: 'ev', dietType: 'vegan', householdSize: 4 }
    render(<Onboarding initial={initial} onComplete={() => {}} />)
    // Electric option should be highlighted as active
    expect(screen.getByRole('button', { name: 'Electric' }).className).toMatch(/active/)
  })
})
