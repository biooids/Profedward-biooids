//src/lib/hooks/useFocusOnError

import { useEffect } from "react";
import { FieldErrors, UseFormSetFocus, Path } from "react-hook-form"; // <-- 1. IMPORT 'Path'

/**
 * A generic custom hook to automatically set focus on the first field
 * that has a validation error in a react-hook-form.
 * @param errors The `errors` object from `useForm`'s `formState`.
 * @param setFocus The `setFocus` function from `useForm`.
 */
export function useFocusOnError<T extends Record<string, any>>(
  errors: FieldErrors<T>,
  setFocus: UseFormSetFocus<T>
) {
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      // Get the name of the first field that has an error.
      // The keys of the 'errors' object are valid paths to the form fields.
      const firstErrorField = Object.keys(errors)[0] as Path<T>; // <-- 2. CAST to 'Path<T>'

      if (firstErrorField) {
        // Set the browser focus to that input field.
        setFocus(firstErrorField);
      }
    }
  }, [errors, setFocus]);
}
