import { MenuItem } from '@/types';
import bibimbapImg from '@/assets/bibimbap.jpg';
import bulgogiImg from '@/assets/bulgogi.jpg';
import kimchiJjigaeImg from '@/assets/kimchi-jjigae.jpg';


export const menuItems: MenuItem[] = [
  // Main Dishes
  {
    id: '1',
    name: 'Bibimbap',
    description: 'Mixed rice with vegetables, meat, and fried egg served in a hot stone bowl',
    price: 16.99,
    category: 'Main Dishes',
    image: bibimbapImg,
    isVegetarian: false,
    isSpicy: false
  },
  {
    id: '2',
    name: 'Bulgogi',
    description: 'Marinated beef BBQ with onions and vegetables served with steamed rice',
    price: 19.99,
    category: 'Main Dishes',
    image: bulgogiImg,
    isVegetarian: false,
    isSpicy: false
  },
  {
    id: '3',
    name: 'Kimchi Jjigae',
    description: 'Spicy kimchi stew with tofu, pork, and vegetables',
    price: 14.99,
    category: 'Soups',
    image: kimchiJjigaeImg,
    isVegetarian: false,
    isSpicy: true
  },
  {
    id: '4',
    name: 'Japchae',
    description: 'Sweet potato starch noodles with vegetables and beef',
    price: 15.99,
    category: 'Main Dishes',
    image: bibimbapImg, // Placeholder
    isVegetarian: false,
    isSpicy: false
  },
  {
    id: '5',
    name: 'Korean Fried Chicken',
    description: 'Crispy fried chicken with sweet and spicy glaze',
    price: 18.99,
    category: 'Main Dishes',
    image: bulgogiImg, // Placeholder
    isVegetarian: false,
    isSpicy: true
  },
  {
    id: '6',
    name: 'Vegetable Bibimbap',
    description: 'Mixed rice with fresh vegetables and fried egg (vegetarian option)',
    price: 14.99,
    category: 'Main Dishes',
    image: bibimbapImg,
    isVegetarian: true,
    isSpicy: false
  },
  // Appetizers
  {
    id: '7',
    name: 'Korean Pancake (Pajeon)',
    description: 'Savory pancake with scallions and seafood',
    price: 8.99,
    category: 'Appetizers',
    image: kimchiJjigaeImg, // Placeholder
    isVegetarian: false,
    isSpicy: false
  },
  {
    id: '8',
    name: 'Kimchi',
    description: 'Traditional fermented cabbage with Korean spices',
    price: 5.99,
    category: 'Appetizers',
    image: kimchiJjigaeImg,
    isVegetarian: true,
    isSpicy: true
  },
  {
    id: '9',
    name: 'Korean Dumplings (Mandu)',
    description: 'Steamed dumplings filled with pork and vegetables',
    price: 9.99,
    category: 'Appetizers',
    image: bulgogiImg, // Placeholder
    isVegetarian: false,
    isSpicy: false
  },
  // Beverages
  {
    id: '10',
    name: 'Korean Green Tea',
    description: 'Traditional Korean green tea',
    price: 3.99,
    category: 'Beverages',
    image: bibimbapImg, // Placeholder
    isVegetarian: true,
    isSpicy: false
  },
  {
    id: '11',
    name: 'Korean Beer (Hite)',
    description: 'Refreshing Korean lager beer',
    price: 4.99,
    category: 'Beverages',
    image: bulgogiImg, // Placeholder
    isVegetarian: true,
    isSpicy: false
  },
  {
    id: '12',
    name: 'Sikhye',
    description: 'Traditional sweet Korean rice drink',
    price: 4.99,
    category: 'Beverages',
    image: kimchiJjigaeImg, // Placeholder
    isVegetarian: true,
    isSpicy: false
  }
];

export const categories = ['All', 'Main Dishes', 'Soups', 'Appetizers', 'Beverages'];