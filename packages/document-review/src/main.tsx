import React from 'react'
import ReactDOM from 'react-dom/client'
import DocumentReview from './DocumentReview'

const exampleData = {
  1: { 'a': "ABC123",
  'b': 123 },
  2: ['a', 'b', 'c']
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DocumentReview props={exampleData} />
  </React.StrictMode>
);
