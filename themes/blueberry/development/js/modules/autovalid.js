function autovalid(options = {}) {
    const scope = options.scope || document;
    // const fields = scope.querySelectorAll("input, select, textarea");
    const fields = scope.querySelectorAll("input, textarea");
    const wrappingForm = fields.length ? fields[0].closest("form") : {};

    // Add event listeners for each field
    fields.forEach((field) => {
        field.addEventListener("invalid", (e) => {
            if (options.preventDefault) e.preventDefault();
            markInvalid(field);
        });

        field.addEventListener("input", () => {
            if (field.validity.valid) {
                markValid(field);
            }
        });

        field.addEventListener("blur", () => {
            field.checkValidity() ? markValid(field) : markInvalid(field);
        });
    });

    function markInvalid(field) {
        field.classList.add("invalid");
        const wrappingFieldset = field.closest("fieldset");
        if (wrappingFieldset) wrappingFieldset.classList.add("invalid");
        if (wrappingForm) wrappingForm.classList.add("invalid");
    }

    function markValid(field) {
        field.classList.remove("invalid");
        const wrappingFieldset = field.closest("fieldset");
        if (wrappingFieldset) wrappingFieldset.classList.remove("invalid");
        if (scope.querySelectorAll(":invalid").length < 1) {
            wrappingForm.classList.remove("invalid");
        }
    }
}

exports.autovalid = autovalid;
