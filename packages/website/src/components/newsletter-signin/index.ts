type FormValidationType = "invalid-email" | "api-error";

(() => {
  document.querySelectorAll(".newsletter-form").forEach((htmlFormElement) => {
    const allValidationMessages = Array.from(
      htmlFormElement.querySelectorAll<HTMLSpanElement>("[data-validation-type]")
    );

    const emailInput = htmlFormElement.querySelector<HTMLInputElement>("input[type=email]");

    //emailInput.setCustomValidity("L’adresse email doit être au format : adresse@email.com");
    emailInput.addEventListener("input", (e) => {
      if (emailInputValueIsValid()) {
        removeValidationMessage("invalid-email");
      }
    });

    emailInput.addEventListener("blur", (e) => {
      if (emailInputValueIsValid()) {
        removeValidationMessage("invalid-email");
      } else {
        displayValidationMessage("invalid-email");
      }
    });

    let fetching = false;
    htmlFormElement.addEventListener("submit", (e) => {
      e.preventDefault();

      if (emailInputValueIsValid()) {
        removeAllValidationMessages();

        fetching = true;
      }
    });

    function emailInputValueIsValid() {
      return emailInput.value.length && emailInput.validity.valid;
    }

    function displayValidationMessage(validationType: FormValidationType) {
      const validationMessage = allValidationMessages.find(
        (htmlElement) => htmlElement.dataset.validationType === validationType
      );

      if (validationMessage && validationMessage.classList.contains("hidden")) {
        validationMessage.classList.remove("hidden");
      }
    }

    function removeValidationMessage(validationType: FormValidationType) {
      const validationMessage = allValidationMessages.find(
        (htmlElement) => htmlElement.dataset.validationType === validationType
      );

      if (validationMessage && !validationMessage.classList.contains("hidden")) {
        validationMessage.classList.add("hidden");
      }
    }

    function removeAllValidationMessages() {
      allValidationMessages.forEach((htmlElement) => {
        if (!htmlElement.classList.contains("hidden")) {
          htmlElement.classList.add("hidden");
        }
      });
    }
  });
})();
