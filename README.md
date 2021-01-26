# countHubXp v1.0

Count your xp hubs with a single command. Yes it's possible with this script.

This script lists these different activities:
- Hackathon
- Workshop / CodingBattle
- Talk / Hubtalk

You can see all the activities where you have been present or absent as well as the activities where you are registered but which have not yet started.

## Requirement:
- NodeJS 14.8.0 or later
- Git

## Common setup:
Clone the repo and install the dependencies.

```
git clone https://github.com/hugo-bach/countHubXp.git
cd countHubXp
npm install
```

### Autologin intra EPITECH
Go with your account on the [intra](https://intra.epitech.eu) > Administration section > Generate autologin link.
Or it's faster to click [here](https://intra.epitech.eu/admin/autolog)

You have a link of the followin format:
```diff
https://intra.epitech.eu/auth-id
```
Copy this id
```diff
! WARNING: Never communicate your link or autologin code.
! This script does not send any request other than that of the intra
```

### Env
Create your `.env` file at the root of the project
Insert in your in file the following code :
```
ID_AUTOLOGIN="id"
```

`id`: it's your id of autologin link of epitech intra

### Running the project
```
npm start
```

Thx and don't forget to subscribe and put your star
