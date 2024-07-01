"use client";

import React, { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
} from "@stripe/react-stripe-js";
import { Loader } from "./LoadingComponent";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAtom } from "jotai";
import { SuccessMessage, errorAtom } from "../state";
import { useRouter } from "next/navigation";
function convertToSubcurrency(amount: number, factor = 100) {
  return Math.round(amount * factor);
}


const CheckoutPage = ({ amount }: { amount: number }) => {
  const stripe = useStripe();
  const router = useRouter()
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [,setMessage] = useAtom(SuccessMessage)
  const [ , setError] = useAtom(errorAtom)
  useQuery({
    queryKey: ["client_secret", amount],
    queryFn: async () => {
      const { data } = await axios.post("/api/create-payment-intend", {
        amount: convertToSubcurrency(amount),
      });
      setClientSecret(data.clientSecret);
      return data;
    },
  });
 const mutation = useMutation({
  mutationFn:async(address:string)=>{
    const {data} =await axios.post('/api/order' , {address})
    return data
  } , 
  onSuccess:()=>{
    setMessage('Your order is on his way to you..')
    router.push('/')
  } , 
  onError:(error:any)=>{
    setError(error?.response?.data?.error || "An error occured while handling your order")
  }
 })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      return;
    }
    

    const { error: submitError } = await elements.submit();

    if (submitError) {
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      clientSecret , 
      confirmParams: {
        return_url: `https://ecommerce.lcl.host:44318`,
      },
      redirect: "if_required"
    });

    if (result.error) {
      setErrorMessage(result.error.message);
    } else {
      const addressElement = elements.getElement(AddressElement)?.getValue();
      const address = (await addressElement)?.value.address
      

    if (!address) {
      setLoading(false);
      setError("Address information is missing.");
      return;
    }

    mutation.mutateAsync(JSON.stringify(address))
    
    }

    setLoading(false);
  };

  if ( !stripe || !elements) {
    return (
      <Loader/>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="bg-white p-2 rounded-md border ">
      <h3 className="text-3xl text-black mb-5">Payment</h3>
      <label className="mb-4 text-xl text-gray-500 font-bold">Total: ${amount}</label>
      {clientSecret &&
      <>
      <PaymentElement />
      <AddressElement 
      options={{
        mode:'shipping' ,

      }} />
      </>
}
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}

      <button
        disabled={!stripe || loading}
        className="text-white w-full h-12 bg-black mt-2 rounded-md font-bold disabled:opacity-50 disabled:animate-pulse"
      >
        {!loading ? `Pay $${amount}` : "Processing..."}
      </button>
    </form>
  );
};

export default CheckoutPage;