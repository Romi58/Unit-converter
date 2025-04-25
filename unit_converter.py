import reflex as rx
import math

# Define conversion factors and categories
CONVERSIONS = {
    "length": {
        "Meter": 1.0,
        "Kilometer": 0.001,
        "Centimeter": 100.0,
        "Millimeter": 1000.0,
        "Mile": 0.000621371,
        "Yard": 1.09361,
        "Foot": 3.28084,
        "Inch": 39.3701,
    },
    "weight": {
        "Kilogram": 1.0,
        "Gram": 1000.0,
        "Milligram": 1000000.0,
        "Metric Ton": 0.001,
        "Pound": 2.20462,
        "Ounce": 35.274,
    },
    "temperature": {
        "Celsius": "C",
        "Fahrenheit": "F",
        "Kelvin": "K",
    },
    "area": {
        "Square Meter": 1.0,
        "Square Kilometer": 0.000001,
        "Square Centimeter": 10000.0,
        "Square Millimeter": 1000000.0,
        "Square Mile": 3.861e-7,
        "Square Yard": 1.19599,
        "Square Foot": 10.7639,
        "Square Inch": 1550.0,
        "Acre": 0.000247105,
        "Hectare": 0.0001,
    },
    "volume": {
        "Cubic Meter": 1.0,
        "Cubic Centimeter": 1000000.0,
        "Liter": 1000.0,
        "Milliliter": 1000000.0,
        "Gallon (US)": 264.172,
        "Quart (US)": 1056.69,
        "Pint (US)": 2113.38,
        "Cup (US)": 4226.75,
        "Fluid Ounce (US)": 33814.0,
        "Tablespoon (US)": 67628.0,
        "Teaspoon (US)": 202884.0,
    },
}

class State(rx.State):
    # State variables
    category: str = "length"
    from_unit: str = list(CONVERSIONS["length"].keys())[0]
    to_unit: str = list(CONVERSIONS["length"].keys())[1]
    input_value: str = "1"
    result: str = ""
    
    # Computed properties
    @rx.var
    def available_units(self) -> list:
        return list(CONVERSIONS[self.category].keys())
    
    @rx.var
    def conversion_result(self) -> str:
        try:
            value = float(self.input_value)
            
            # Handle temperature conversions specially
            if self.category == "temperature":
                if self.from_unit == "Celsius" and self.to_unit == "Fahrenheit":
                    result = (value * 9/5) + 32
                elif self.from_unit == "Celsius" and self.to_unit == "Kelvin":
                    result = value + 273.15
                elif self.from_unit == "Fahrenheit" and self.to_unit == "Celsius":
                    result = (value - 32) * 5/9
                elif self.from_unit == "Fahrenheit" and self.to_unit == "Kelvin":
                    result = (value - 32) * 5/9 + 273.15
                elif self.from_unit == "Kelvin" and self.to_unit == "Celsius":
                    result = value - 273.15
                elif self.from_unit == "Kelvin" and self.to_unit == "Fahrenheit":
                    result = (value - 273.15) * 9/5 + 32
                else:  # Same unit
                    result = value
            else:
                # For other conversions, use the conversion factors
                from_factor = CONVERSIONS[self.category][self.from_unit]
                to_factor = CONVERSIONS[self.category][self.to_unit]
                
                # Convert to base unit then to target unit
                if isinstance(from_factor, (int, float)) and isinstance(to_factor, (int, float)):
                    base_value = value / from_factor
                    result = base_value * to_factor
                else:
                    return "Conversion not supported"
            
            # Format the result
            if abs(result) < 0.000001 or abs(result) > 1000000:
                return f"{result:.6e} {self.to_unit}"
            else:
                return f"{result:.6f} {self.to_unit}".rstrip('0').rstrip('.') + f" {self.to_unit}"
                
        except ValueError:
            return "Please enter a valid number"
        except Exception as e:
            return f"Error: {str(e)}"
    
    # Event handlers
    def set_category(self, category: str):
        self.category = category
        self.from_unit = list(CONVERSIONS[category].keys())[0]
        self.to_unit = list(CONVERSIONS[category].keys())[1]
    
    def set_from_unit(self, unit: str):
        self.from_unit = unit
        # Avoid same unit for from and to
        if self.from_unit == self.to_unit:
            units = self.available_units
            for u in units:
                if u != self.from_unit:
                    self.to_unit = u
                    break
    
    def set_to_unit(self, unit: str):
        self.to_unit = unit
    
    def swap_units(self):
        self.from_unit, self.to_unit = self.to_unit, self.from_unit
    
    def clear_input(self):
        self.input_value = ""


# UI Components
def navbar():
    return rx.box(
        rx.hstack(
            rx.heading("Unit Converter", size="lg"),
            rx.spacer(),
            justify="space-between",
            padding="1em",
        ),
        bg="rgba(255, 255, 255, 0.9)",
        backdrop_filter="blur(10px)",
        padding_x="2em",
        border_bottom="1px solid #eaeaea",
        width="100%",
        position="sticky",
        top="0",
        z_index="999",
    )

def category_tabs():
    return rx.tabs(
        rx.tab_list(
            *[
                rx.tab(
                    category.capitalize(),
                    on_click=lambda c=category: State.set_category(c),
                )
                for category in CONVERSIONS.keys()
            ],
            padding_y="1em",
        ),
        variant="soft-rounded",
        color_scheme="teal",
        width="100%",
    )

def converter_card():
    return rx.card(
        rx.vstack(
            rx.hstack(
                rx.select(
                    State.available_units,
                    value=State.from_unit,
                    on_change=State.set_from_unit,
                    width="100%",
                ),
                rx.icon_button(
                    icon=rx.icon("arrow-left-right"),
                    on_click=State.swap_units,
                    variant="outline",
                    aria_label="Swap units",
                ),
                rx.select(
                    State.available_units,
                    value=State.to_unit,
                    on_change=State.set_to_unit,
                    width="100%",
                ),
                spacing="1em",
                width="100%",
            ),
            rx.hstack(
                rx.input(
                    placeholder="Enter value",
                    value=State.input_value,
                    on_change=lambda v: setattr(State, "input_value", v),
                    width="100%",
                    size="lg",
                ),
                rx.button(
                    "Clear",
                    on_click=State.clear_input,
                    variant="outline",
                ),
                width="100%",
                padding_y="1em",
            ),
            rx.divider(),
            rx.box(
                rx.text(
                    State.conversion_result,
                    font_size="1.5em",
                    font_weight="bold",
                    color="teal.500",
                ),
                padding="1em",
                width="100%",
                min_height="4em",
                border_radius="md",
                bg="rgba(0, 128, 128, 0.05)",
                text_align="center",
            ),
            width="100%",
            spacing="1em",
        ),
        width="100%",
        max_width="600px",
    )

def footer():
    return rx.box(
        rx.text(
            "Built with Python and Reflex",
            font_size="0.8em",
            color="gray.500",
        ),
        padding="2em",
        text_align="center",
    )

def index():
    return rx.box(
        navbar(),
        rx.center(
            rx.vstack(
                rx.heading("Unit Converter", size="xl", padding_top="1em"),
                rx.text(
                    "Convert between different units of measurement",
                    color="gray.500",
                    padding_bottom="1em",
                ),
                category_tabs(),
                converter_card(),
                width="100%",
                max_width="800px",
                padding="2em",
                spacing="2em",
            ),
        ),
        footer(),
        min_height="100vh",
        bg="linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    )

# Create the app
app = rx.App()
app.add_page(index)

# Run the app
if __name__ == "__main__":
    app.compile()
