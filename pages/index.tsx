import {
	startRegistration,
	startAuthentication,
} from '@simplewebauthn/browser';

const email = 'viyeta@gmail.com';
const password = 'password';

export default function Home() {
	const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ODkyNzA5MDYzMTY0OTA0MSIsImlhdCI6MTYzNjg1MzE4NSwiZXhwIjoxNjQ0NjI5MTg1LCJzdWIiOiJlbXBsb3llZSJ9.IlMIYgGysXFUr7UPplIVFVqFzPBZf5A-2mjs_rwrTwg';
  const onClick = async () => {
		
		const resp = await fetch(
			'/api/webauthn/generate-registration-options',
			{
				method: 'GET',
				headers: new Headers({ authorization: `Bearer ${token}` }),
			}
		);
		const { options } = await resp.json();

		let attResp;
		try {
			// Pass the options to the authenticator and wait for a response
      console.log(`Options`);
      console.log(options);
			attResp = await startRegistration(options);
      console.log(`Attestaino resp`);
			console.log(attResp);
		} catch (error) {
			console.error(error);
		}

		const verificationResp = await fetch(
			'/api/webauthn/verify-registration',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(attResp),
			}
		);

		const verificationJSON = await verificationResp.json();
		if (verificationJSON && verificationJSON.verified) {
			alert(`Verified successfully`);
		}
	};

	const onLoginClick = async () => {
		const resp = await fetch(
			'/api/webauthn/generate-authentication-options',
      {
				method: 'GET',
				headers: new Headers({ authorization: 'Basic ' + btoa(`${email}:${password}`) }),
			}
		);

		let asseResp;
		try {
			// Pass the options to the authenticator and wait for a response
      
			const { options } = await resp.json();
      console.log(`Options`);
      console.log(options);
      options.allowCredentials = options.allowCredentials.map((a) => {
        return {
          id: a.id,
          type: 'public-key'
        }
      } )
			asseResp = await startAuthentication(options);
      
			console.log(asseResp);
		} catch (error) {
			console.error(error);
		}

    const verificationResp = await fetch('/api/webauthn/verify-authentication', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': 'Basic ' + btoa(`${email}:${password}`)
      },
      body: JSON.stringify(asseResp),
    });

    // Wait for the results of verification
    const verificationJSON = await verificationResp.json();
    if (verificationJSON && verificationJSON.verified) {
      console.log(`You are verified successfully`);
    }
	};

	return (
		<div>
			<button onClick={onClick}>Touch me</button>
			<button onClick={onLoginClick}>Login</button>
		</div>
	);
}
