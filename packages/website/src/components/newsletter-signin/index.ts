import { proxy, subscribe } from "valtio";
import cs from "classnames";
import { onDOMReady } from "scripts/onDOMReady";

interface State {
  httpStatus: null | number;
  loading: boolean;
  invalidEmail: boolean;
}

onDOMReady(() => {
  document.querySelectorAll<HTMLFormElement>(".newsletter-form").forEach((htmlFormElement) => {
    const submitButton = htmlFormElement.querySelector("button.pushable");
    const invalidEmailMessage = htmlFormElement.querySelector('[data-validation-type="invalid-email"]');
    const emailInput = htmlFormElement.querySelector<HTMLInputElement>("input[type=email]");

    if (!emailInput) {
      return;
    }

    const state = proxy<State>({
      httpStatus: null,
      loading: false,
      invalidEmail: !getEmailInputValueIsValid(),
    });

    subscribe(state, () => {
      if (state.loading) {
        toggleButtonLoadingState(true);
      } else {
        toggleButtonLoadingState(false);
      }
    });

    subscribe(state, () => {
      if (!state.loading && state.httpStatus !== null) {
        if (state.httpStatus === 409 || state.httpStatus < 400) {
          emailInput.value = "";

          try {
            window.lintrk("track", { conversion_id: 6087946 });
          } catch (error) {
            console.error("Couldn't send LinkedIn tracking event after successful newsletter form submission.", error);
          }
        }
      }
    });

    ["input", "focus", "blur"].forEach((event) => {
      emailInput.addEventListener(event, (e) => {
        state.invalidEmail = !getEmailInputValueIsValid();

        if (state.invalidEmail) {
          if (e.type === "blur" && emailInput.value.length) {
            toggleValidationMessage(true);
          }
        } else {
          toggleInputInvalidCSSClass(false);
          toggleValidationMessage(false);
        }
      });
    });

    htmlFormElement.addEventListener("submit", (e) => {
      e.preventDefault();

      if (state.loading || state.invalidEmail) {
        if (state.invalidEmail) {
          toggleInputInvalidCSSClass(true);
          toggleValidationMessage(true);
        }

        return;
      }

      submitForm(emailInput.value);
    });

    function submitForm(emailValue: string) {
      state.loading = true;

      fetch("/subscribe", {
        method: "POST",
        body: JSON.stringify({
          email: emailValue,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          state.httpStatus = response.status;
          state.loading = false;

          displayValidationHTML();
        })
        .catch(() => {
          state.httpStatus = 500;
          state.loading = false;
        });
    }

    function toggleInputInvalidCSSClass(addClass: boolean) {
      if (addClass) {
        emailInput?.classList.add("invalid");
      } else {
        emailInput?.classList.remove("invalid");
      }
    }

    function toggleValidationMessage(show: boolean) {
      if (show) {
        invalidEmailMessage?.classList.remove("hidden");
      } else {
        invalidEmailMessage?.classList.add("hidden");
      }
    }

    function toggleButtonLoadingState(loading: boolean) {
      if (loading) {
        submitButton?.classList.add("loading");
      } else {
        submitButton?.classList.remove("loading");
      }
    }

    function getEmailInputValueIsValid() {
      return !emailInput ? false : emailInput.value.length > 0 && emailInput.checkValidity();
    }

    function displayValidationHTML() {
      htmlFormElement.style.display = "none";
      htmlFormElement.style.opacity = "0";

      const htmlContent = getValidationHTML();
      const wrapper = document.createElement("div");
      wrapper.setAttribute("role", "status");
      wrapper.style.opacity = "0";
      wrapper.style.transition = "opacity 250ms ease-out";
      wrapper.innerHTML = htmlContent;

      htmlFormElement.before(wrapper);

      requestAnimationFrame(() => {
        wrapper.style.opacity = "1";
      });

      wrapper.querySelector("button")?.addEventListener(
        "click",
        () => {
          wrapper.remove();

          state.httpStatus = null;
          state.loading = false;
          state.invalidEmail = !getEmailInputValueIsValid();

          htmlFormElement.style.display = "block";

          requestAnimationFrame(() => {
            htmlFormElement.style.opacity = "1";
          });
        },
        { once: true },
      );
    }

    function getValidationHTML(): string {
      const { httpStatus } = state;

      if (!httpStatus) {
        return "";
      }

      const buttonCSSClassnames = cs([
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
      ]);

      return `
        <p class="text-2xl leading-[34px] mb-4 text-blue font-bold lg:text-4xl lg:leading-[56px]">
          ${
            httpStatus < 400
              ? "✅ Cool, votre demande est enregistrée. Pensez à la confirmer !"
              : httpStatus === 409
                ? "✅ Pas d’inquiétude, votre adresse email est déjà dans notre liste !"
                : "❌ Petit souci technique... L’inscription n’a pas fonctionné."
          }
        </p>

        <p class="text-lg mb-10">
        ${
          httpStatus < 400
            ? "On vous demandera bientôt de nous aider à définir le prix du cours. Pour vous remercier, vous recevrez un code promo valable lors du lancement !"
            : httpStatus === 409
              ? "Ça, c’est de la motivation. À très bientôt !"
              : "Réessayez un peu plus tard ou écrivez-nous à <a href='mailto:contact@animerdesateliers.com' class='underline'>contact@animerdesateliers.com</a>."
        }
        </p>

        <button class="${buttonCSSClassnames}">
        ${httpStatus < 400 ? "Bien compris, je checke mes emails" : "Revenir à l’étape précédente"}
        </button>
      `;
    }
  });
});
