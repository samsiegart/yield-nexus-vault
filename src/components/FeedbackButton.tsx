import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { FeedbackForm } from './FeedbackForm';

export const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 p-0 shadow-lg bg-blue-600 hover:bg-blue-700"
        aria-label="Open feedback form"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
      <FeedbackForm isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};