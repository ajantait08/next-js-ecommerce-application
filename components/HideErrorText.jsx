"use client";
import { useEffect } from "react";

export default function HideErrorText(){
    useEffect(() => {
        const targetText = "Address country should be a two letter country code. Refer: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2";
        const replacementText = "The country code is invalid.";
        const hideMatchingElements = () => {
            const elements = document.querySelectorAll('.text-red-500');
            elements.forEach((el) => {
                if (el.textContent.includes(targetText)) {
                    el.textContent = replacementText;
                }
            });
        };

    const observer = new MutationObserver(() => {
        hideMatchingElements();
      });
  

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
        
      return () => observer.disconnect();
    },[]);

    return null;
}