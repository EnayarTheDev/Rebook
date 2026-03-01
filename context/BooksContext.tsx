'use client';

import React, { createContext, useContext, useState } from 'react';

export interface Book {
  id: number;
  title: string;
  subject: string;
  level: string;
  condition: string;
  price: number;
  paymentType: string;
  seller: string;
  contact: string;
  description: string;
  sold: boolean;
  isOffered?: boolean;
}

export interface SwapRequest {
  id: string;
  bookId: number;
  requesterBooks: number[];
  requesterName: string;
  requesterContact: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface BooksContextType {
  books: Book[];
  addBook: (book: Omit<Book, 'id' | 'sold'>) => void;
  getBook: (id: number) => Book | undefined;
  bcBalance: number;
  setBcBalance: (balance: number) => void;
  swapRequests: SwapRequest[];
  addSwapRequest: (request: Omit<SwapRequest, 'id'>) => void;
  getUserOfferedBooks: () => Book[];
}

const BooksContext = createContext<BooksContextType | undefined>(undefined);

const initialBooks: Book[] = [
  {
    id: 1,
    title: "Mathématiques 1ère année BAC",
    subject: "math",
    level: "lycee",
    condition: "excellent",
    price: 60,
    paymentType: "cash",
    seller: "Ahmed M.",
    contact: "ahmed@email.com",
    description: "Livre en excellent état, jamais utilisé. Toutes les pages sont intactes.",
    sold: false
  },
  {
    id: 2,
    title: "Physique-Chimie 3ème",
    subject: "physics",
    level: "college",
    condition: "good",
    price: 40,
    paymentType: "bc",
    seller: "Sara L.",
    contact: "0612345678",
    description: "Quelques annotations au crayon facilement effaçables.",
    sold: false
  },
  {
    id: 3,
    title: "Français Tronc Commun",
    subject: "french",
    level: "lycee",
    condition: "excellent",
    price: 50,
    paymentType: "cash",
    seller: "Karim B.",
    contact: "karim@email.com",
    description: "Comme neuf, couverture protégée avec film plastique.",
    sold: false
  },
  {
    id: 4,
    title: "English for All 2BAC",
    subject: "english",
    level: "lycee",
    condition: "good",
    price: 45,
    paymentType: "bc",
    seller: "Yasmine K.",
    contact: "0698765432",
    description: "Bon état général, pages propres.",
    sold: false
  },
  {
    id: 5,
    title: "Histoire-Géographie 4ème",
    subject: "history",
    level: "college",
    condition: "fair",
    price: 30,
    paymentType: "cash",
    seller: "Omar T.",
    contact: "omar@email.com",
    description: "État correct, couverture légèrement usée mais pages intactes.",
    sold: false
  },
  {
    id: 6,
    title: "Algèbre 2BAC Sciences",
    subject: "math",
    level: "lycee",
    condition: "excellent",
    price: 50,
    paymentType: "bc",
    seller: "Nadia F.",
    contact: "0655443322",
    description: "Neuf, jamais ouvert. Emballage d'origine.",
    sold: false
  }
];

export function BooksProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [bcBalance, setBcBalance] = useState(500);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);

  const addBook = (book: Omit<Book, 'id' | 'sold'>) => {
    const newBook: Book = {
      ...book,
      id: Math.max(...books.map(b => b.id), 0) + 1,
      sold: false,
      isOffered: true
    };
    setBooks([...books, newBook]);
  };

  const getBook = (id: number) => {
    return books.find(b => b.id === id);
  };

  const addSwapRequest = (request: Omit<SwapRequest, 'id'>) => {
    const newRequest: SwapRequest = {
      ...request,
      id: `swap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setSwapRequests([...swapRequests, newRequest]);
  };

  const getUserOfferedBooks = () => {
    return books.filter(b => b.isOffered && b.seller === 'You');
  };

  return (
    <BooksContext.Provider value={{ books, addBook, getBook, bcBalance, setBcBalance, swapRequests, addSwapRequest, getUserOfferedBooks }}>
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BooksContext);
  if (!context) {
    throw new Error('useBooks must be used within BooksProvider');
  }
  return context;
}
