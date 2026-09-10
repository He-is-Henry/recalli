import SignupForm from "@/components/auth/SignupForm";
import styles from "@/components/auth/signup.module.css";

export default function SignupPage() {
  return (
    <main className={styles.main}>
      <SignupForm defaultAccountType="user" allowSwitching={true} />
    </main>
  );
}