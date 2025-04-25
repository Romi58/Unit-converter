import reflex as rx

class State(rx.State):
    count: int = 0

    def increment(self):
        self.count += 1
    
    def decrement(self):
        self.count -= 1

def index():
    return rx.center(
        rx.vstack(
            rx.heading("Python Frontend Counter"),
            rx.text(f"Count: {State.count}"),
            rx.hstack(
                rx.button("Decrement", on_click=State.decrement),
                rx.button("Increment", on_click=State.increment, color_scheme="blue"),
            ),
            spacing="24px",
            padding="24px",
            border_radius="12px",
            box_shadow="lg",
        ),
        height="100vh",
    )

app = rx.App()
app.add_page(index)

if __name__ == "__main__":
    app.compile()
