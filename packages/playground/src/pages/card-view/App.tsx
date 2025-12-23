import { useCallback, useEffect, useState } from '@lynx-js/react'
import './App.css'

import { close } from 'sparkling-router';
import * as storage from 'sparkling-storage';

interface CardItem {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  price?: string;
  rating?: number;
  category?: string;
}

export function App(props: {
  onMounted?: () => void
}) {

  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [cardData, setCardData] = useState<CardItem[]>([]);

  useEffect(() => {
    console.info('Hello, Card View Demo')
    props.onMounted?.()
    
    // Initialize card data
    const mockCards: CardItem[] = [
      {
        id: 1,
        title: "Premium Coffee",
        description: "Experience the finest coffee beans from around the world, expertly roasted to perfection.",
        price: "$12.99",
        rating: 4.8,
        category: "Beverages"
      },
      {
        id: 2,
        title: "Organic Tea Collection",
        description: "A curated selection of organic teas, from delicate white teas to robust black teas.",
        price: "$8.50",
        rating: 4.6,
        category: "Beverages"
      },
      {
        id: 3,
        title: "Artisan Chocolate",
        description: "Handcrafted chocolate made with single-origin cacao and natural ingredients.",
        price: "$15.75",
        rating: 4.9,
        category: "Desserts"
      },
      {
        id: 4,
        title: "Fresh Pastries",
        description: "Daily baked pastries using traditional techniques and premium ingredients.",
        price: "$6.25",
        rating: 4.7,
        category: "Bakery"
      },
      {
        id: 5,
        title: "Signature Blend",
        description: "Our exclusive house blend, crafted from 5 different origins for a unique taste.",
        price: "$18.00",
        rating: 5.0,
        category: "Specialty"
      }
    ];
    
    setCardData(mockCards);
  }, [])

  const onClose = useCallback(() => {
    close();
  }, []);

  const handleCardClick = useCallback((card: CardItem) => {
    setSelectedCard(card);
    
    // Store selected card data
    storage.setItem({
      key: 'selected_card',
      data: card,
    }, (v: storage.SetItemResponse) => {
      console.log('Card data stored:', v);
    });
  }, []);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const stars = [];
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<text key={i} className="star">★</text>);
    }
    
    return stars;
  };

  return (
    <view>
      <view className='App'>
        <view className='Header'>
          <text className='Title'>Card View Demo</text>
          <text className='Subtitle'>Explore our featured products</text>
        </view>
        
        <view className='Content'>
          <scroll-view 
            className='card-container'
            scroll-orientation='vertical'
          >
            {cardData.map((card) => (
              <view 
                key={card.id}
                className={`card ${selectedCard?.id === card.id ? 'selected' : ''}`}
                bindtap={() => handleCardClick(card)}
              >
                <view className='card-header'>
                  <text className='card-category'>{card.category}</text>
                  <view className='card-rating'>
                    {renderStars(card.rating || 0)}
                    <text className='rating-text'>{card.rating}</text>
                  </view>
                </view>
                
                <view className='card-body'>
                  <text className='card-title'>{card.title}</text>
                  <text className='card-description'>{card.description}</text>
                </view>
                
                <view className='card-footer'>
                  <text className='card-price'>{card.price}</text>
                  <text className='card-action'>View Details →</text>
                </view>
              </view>
            ))}
          </scroll-view>
          
          {selectedCard && (
            <view className='selected-card-info'>
              <text className='info-title'>Selected: {selectedCard.title}</text>
              <text className='info-price'>Price: {selectedCard.price}</text>
            </view>
          )}
          
          <view className='button-group'>
            <text className='Button' bindtap={onClose}>
              Close
            </text>
            <text 
              className='Button secondary' 
              bindtap={() => {
                storage.getItem({
                  key: 'selected_card'
                }, (v: storage.GetItemResponse) => {
                  console.log('Last selected card:', v.data);
                });
              }}
            >
              Show Last Selection
            </text>
          </view>
        </view>
      </view>
    </view>
  )
}
