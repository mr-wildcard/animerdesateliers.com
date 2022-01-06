// @ts-ignore
import { proxy, subscribe } from "valtio";

window.addEventListener("DOMContentLoaded", (event) => {
  document.querySelectorAll<HTMLFormElement>(".newsletter-form").forEach((htmlFormElement) => {
    const submitButton = htmlFormElement.querySelector("button.pushable");
    const invalidEmailMessage = htmlFormElement.querySelector('[data-validation-type="invalid-email"]');
    const emailInput = htmlFormElement.querySelector<HTMLInputElement>("input[type=email]");

    const state = proxy({
      statuses: {
        loading: false,
        success: false,
        failed: false,
      },
      errors: {
        invalidEmail: getEmailInputValueIsValid(),
      },
    });

    subscribe(state.errors, () => {
      if (state.errors.invalidEmail) {
        toggleInputValidationMessage(true);
      } else {
        toggleInputValidationMessage(false);
      }
    });

    subscribe(state.statuses, () => {
      if (state.statuses.loading) {
        toggleButtonLoadingState(true);
      } else {
        toggleButtonLoadingState(false);
      }
    });

    subscribe(state.statuses, () => {
      if (!state.statuses.loading) {
        if (state.statuses.success) {
          displayValidationHTML(true);
          emailInput.value = "";
        } else if (state.statuses.failed) {
          displayValidationHTML(false);
        }
      }
    });

    ["input", "focus", "blur"].forEach((event) => {
      emailInput.addEventListener(event, (e) => {
        state.errors.invalidEmail = !getEmailInputValueIsValid();
      });
    });

    htmlFormElement.addEventListener("submit", (e) => {
      e.preventDefault();

      if (state.statuses.loading || state.errors.invalidEmail) {
        if (state.errors.invalidEmail) {
          toggleInputValidationMessage(true);
        }

        return;
      }

      submitForm();
    });

    function submitForm() {
      state.statuses.loading = true;

      fetch("/subscribe", {
        method: "POST",
        body: JSON.stringify({
          email: emailInput.value,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          state.statuses.loading = false;

          if (response.ok) {
            state.statuses.success = true;
          } else {
            state.statuses.failed = true;
          }
        })
        .catch((error) => {
          state.statuses.loading = false;
          state.statuses.failed = true;
        });
    }

    function toggleInputValidationMessage(show: boolean) {
      if (show) {
        invalidEmailMessage.classList.remove("hidden");
      } else {
        invalidEmailMessage.classList.add("hidden");
      }
    }

    function toggleButtonLoadingState(loading: boolean) {
      if (loading) {
        submitButton.classList.add("loading");
      } else {
        submitButton.classList.remove("loading");
      }
    }

    function getEmailInputValueIsValid() {
      return !emailInput.value.length || (emailInput.value.length && emailInput.checkValidity());
    }

    function displayValidationHTML(success: boolean) {
      htmlFormElement.style.display = "none";
      htmlFormElement.style.opacity = "0";

      const htmlContent = getValidationHTML(success);
      const wrapper = document.createElement("div");
      wrapper.setAttribute("role", "status");
      wrapper.style.opacity = "0";
      wrapper.style.transition = "opacity 250ms ease-out";
      wrapper.innerHTML = htmlContent;

      htmlFormElement.before(wrapper);

      requestAnimationFrame(() => {
        wrapper.style.opacity = "1";
      });

      wrapper.querySelector("button").addEventListener(
        "click",
        () => {
          wrapper.remove();

          state.statuses.loading = false;
          state.statuses.success = false;
          state.statuses.failed = false;

          htmlFormElement.style.display = "block";

          requestAnimationFrame(() => {
            htmlFormElement.style.opacity = "1";
          });
        },
        { once: true }
      );
    }

    function getValidationHTML(success: boolean) {
      const buttonCSSClassnames = [
        "w-full",
        "text-lg",
        "px-[22px]",
        "py-[14px]",
        "bg-downriver",
        "rounded-full",
        "text-white",
        "text-center",
        "font-bold",
        "border-2",
        "border-downriver",
        "transition",
        "md:text-base",
        "md:w-auto",
        "hover:bg-chiffon",
        "hover:text-downriver",
      ];

      return `
        <p class="text-2xl leading-[34px] mb-4 text-blue font-bold lg:text-4xl lg:leading-[56px]">
          ${
            success
              ? "✅ Cool, votre adresse email est enregistrée. À très bientôt !"
              : "❌ Petit souci technique... L’inscription n’a pas fonctionné."
          }
        </p>

        <p class="text-lg mb-10">
          ${
            success
              ? "On vous a envoyé un email de confirmation où l’on vous demande votre avis sur le futur prix du cours en ligne."
              : "Réessayez un peu plus tard ou écrivez-nous à <a href='mailto:contact@animerdesateliers.com' class='underline'>contact@animerdesateliers.com</a>."
          }
        </p>

        <button class="${buttonCSSClassnames.join(" ")}">
          ${success ? "Bien compris, je checke mes emails" : "Revenir à l’étape précédente"}
        </button>
      `;
    }
  });
});
