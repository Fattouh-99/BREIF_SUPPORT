import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UseFormSetValue, UseFormRegister, FieldValues, Control, useWatch } from 'react-hook-form';
import { CreditCard, Calendar, Lock, Check, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import PaymentSuccess from '@/components/ui/payment-success';

interface Props {
  register: UseFormRegister<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
  control: Control<FieldValues>;
  onPaymentSuccess: () => void;
}

const PaymentForm = ({ register, setValue, control, onPaymentSuccess }: Props) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [errors, setErrors] = useState<{
    cardNumber?: string;
    expiry?: string;
    cvc?: string;
    nameOnCard?: string;
  }>({});

  const selectedPlan = useWatch({
    control,
    name: 'selectedPlan',
  });

  // Detect card type based on first digits
  const getCardType = (number: string) => {
    const visaPattern = /^4/;
    const mastercardPattern = /^5[1-5]/;
    const amexPattern = /^3[47]/;
    
    if (visaPattern.test(number)) return 'visa';
    if (mastercardPattern.test(number)) return 'mastercard';
    if (amexPattern.test(number)) return 'amex';
    return null;
  };

  const cardType = getCardType(cardNumber);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date MM/YY
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return value;
  };

  const validateCardNumber = (value: string) => {
    const numeric = value.replace(/\s+/g, '');
    if (!numeric) return 'Card number is required';
    if (numeric.length < 13 || numeric.length > 19) return 'Card number must be between 13 and 19 digits';
    return undefined;
  };

  const validateExpiry = (value: string) => {
    const [month, year] = value.split('/');
    if (!month || !year) return 'Expiry date is required';
    
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    const numMonth = parseInt(month, 10);
    const numYear = parseInt(year, 10);
    
    if (numMonth < 1 || numMonth > 12) return 'Invalid month';
    if (numYear < currentYear || (numYear === currentYear && numMonth < currentMonth)) {
      return 'Card has expired';
    }
    
    return undefined;
  };

  const validateCvc = (value: string) => {
    if (!value) return 'CVC is required';
    if (value.length < 3 || value.length > 4) return 'CVC must be 3 or 4 digits';
    return undefined;
  };

  const validateNameOnCard = (value: string) => {
    if (!value) return 'Name is required';
    if (value.length < 3) return 'Please enter full name';
    return undefined;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
    setErrors(prev => ({ ...prev, cardNumber: validateCardNumber(formattedValue) }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatExpiry(e.target.value);
    setExpiry(formattedValue);
    setErrors(prev => ({ ...prev, expiry: validateExpiry(formattedValue) }));
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setCvc(value);
    setErrors(prev => ({ ...prev, cvc: validateCvc(value) }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameOnCard(e.target.value);
    setErrors(prev => ({ ...prev, nameOnCard: validateNameOnCard(e.target.value) }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const cardNumberError = validateCardNumber(cardNumber);
    const expiryError = validateExpiry(expiry);
    const cvcError = validateCvc(cvc);
    const nameError = validateNameOnCard(nameOnCard);
    
    const newErrors = {
      cardNumber: cardNumberError,
      expiry: expiryError,
      cvc: cvcError,
      nameOnCard: nameError
    };
    
    setErrors(newErrors);
    
    // Check if there are any errors
    if (cardNumberError || expiryError || cvcError || nameError) {
      return;
    }
    
    // Process payment
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentComplete(true);
      setValue('hasPaid', true);
      onPaymentSuccess();
    }, 2000);
  };

  if (paymentComplete) {
    return <PaymentSuccess 
      selectedPlan={selectedPlan} 
      verified={true}
      onContinue={() => {}}
    />;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Order Summary</h3>
          <span className="text-sm text-muted-foreground">Brief Support</span>
        </div>
        <div className="flex justify-between items-center mb-2 font-semibold">
          <span>
            {selectedPlan === 'standard' && 'Free'}
            {selectedPlan === 'pro' && 'Pro Plan'}
            {selectedPlan === 'ultimate' && 'Ultimate Plan'}
          </span>
          <span>
            {selectedPlan === 'standard' && 'Free'}
            {selectedPlan === 'pro' && '£15/mo'}
            {selectedPlan === 'ultimate' && '£249/mo'}
          </span>
        </div>
        <div className="border-t dark:border-slate-700 pt-2 mt-2 flex justify-between">
          <span className="font-bold">Total</span>
          <span className="font-bold">
            {selectedPlan === 'standard' && 'Free'}
            {selectedPlan === 'pro' && '£15/mo'}
            {selectedPlan === 'ultimate' && '£249/mo'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nameOnCard">Name on Card</Label>
          <div className="relative">
            <Input
              id="nameOnCard"
              placeholder="John Smith"
              value={nameOnCard}
              onChange={handleNameChange}
              className={`pl-10 ${errors.nameOnCard ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <CreditCard className="h-4 w-4" />
            </div>
            {errors.nameOnCard && (
              <div className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.nameOnCard}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="flex space-x-1">
              {['visa', 'mastercard', 'amex'].map((card) => (
                <div 
                  key={card} 
                  className={`w-8 h-5 flex items-center justify-center rounded ${
                    cardType === card ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <Image 
                    src={`/images/${card}.svg`} 
                    alt={card} 
                    width={24} 
                    height={16} 
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              maxLength={19}
              className={`pl-10 ${errors.cardNumber ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <CreditCard className="h-4 w-4" />
            </div>
            {errors.cardNumber && (
              <div className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.cardNumber}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiry">Expiry Date</Label>
            <div className="relative">
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={expiry}
                onChange={handleExpiryChange}
                maxLength={5}
                className={`pl-10 ${errors.expiry ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="h-4 w-4" />
              </div>
              {errors.expiry && (
                <div className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.expiry}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cvc">CVC</Label>
            <div className="relative">
              <Input
                id="cvc"
                placeholder="123"
                value={cvc}
                onChange={handleCvcChange}
                maxLength={4}
                className={`pl-10 ${errors.cvc ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              {errors.cvc && (
                <div className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.cvc}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full h-12 text-base"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : (
              <>
                Pay {selectedPlan === 'standard' && 'Free'}
                {selectedPlan === 'pro' && '£15'}
                {selectedPlan === 'ultimate' && '£249'}
              </>
            )}
          </Button>
        </div>
        
        <div className="text-xs text-center text-muted-foreground mt-4">
          <p>Your payment information is secure. We use industry-standard security measures.</p>
          <div className="flex justify-center mt-2 space-x-2">
            <Lock className="h-3 w-3" /> <span>Secure Payment</span>
          </div>
        </div>
      </form>
    </div>
  );
}

export default PaymentForm; 