<script lang="ts">
  export let form;
  if (typeof window !== 'undefined') {
    $: if (form?.status === 303 && form?.headers?.Location) {
      window.location.href = form.headers.Location;
    }
  }
</script>

<h1>Login</h1>
<form method="POST">
  <input type="hidden" name="provider" value="discord" />
  <button type="submit">Login with Discord</button>
</form>