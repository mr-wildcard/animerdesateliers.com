type FormValidationType = "invalid-email" | "api-error" | "successfully-subscribed" | "already-subscribed";

(() => {
  document.querySelectorAll(".newsletter-form").forEach((htmlFormElement) => {
    const submitButton = htmlFormElement.querySelector("button.pushable");

    const allValidationMessages = Array.from(
      htmlFormElement.querySelectorAll<HTMLSpanElement>("[data-validation-type]")
    );

    const emailInput = htmlFormElement.querySelector<HTMLInputElement>("input[type=email]");

    emailInput.addEventListener("input", (e) => {
      if (emailInputValueIsValid()) {
        removeAllValidationMessages();
      }
    });

    emailInput.addEventListener("blur", (e) => {
      removeAllValidationMessages();

      if (emailInputValueIsValid()) {
        removeValidationMessage("invalid-email");
      } else {
        displayValidationMessage("invalid-email");
      }
    });

    let fetching = false;
    htmlFormElement.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!emailInputValueIsValid()) {
        displayValidationMessage("invalid-email");
      } else {
        removeAllValidationMessages();
        submitButton.classList.add("loading");

        fetching = true;

        fetch("/subscribe", {
          method: "POST",
          body: JSON.stringify({
            email: emailInput.value,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }).then((response) => {
          if (response.ok) {
            displayValidationMessage("successfully-subscribed");
          } else {
            displayValidationMessage("api-error");
          }

          submitButton.classList.remove("loading");

          fetching = false;
        });
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
