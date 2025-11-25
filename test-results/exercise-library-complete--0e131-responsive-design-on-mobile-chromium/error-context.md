# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - heading "🏋️ FitTracker Pro" [level=2] [ref=e5]
      - paragraph [ref=e6]: Sign in to your account
    - generic [ref=e7]:
      - generic [ref=e8]: Invalid login credentials
      - generic [ref=e9]:
        - generic [ref=e10]:
          - generic [ref=e11]: Email address
          - textbox "Email address" [ref=e12]:
            - /placeholder: you@example.com
            - text: test@example.com
        - generic [ref=e13]:
          - generic [ref=e14]: Password
          - textbox "Password" [ref=e15]:
            - /placeholder: ••••••••
            - text: password123
      - button "Sign in" [ref=e17]
      - generic [ref=e18]:
        - text: Don't have an account?
        - link "Sign up" [ref=e19] [cursor=pointer]:
          - /url: /signup
  - button "Open Next.js Dev Tools" [ref=e25] [cursor=pointer]:
    - img [ref=e26]
  - alert [ref=e29]
```