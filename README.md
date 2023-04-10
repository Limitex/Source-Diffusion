# Source-Diffusion

This software is very easy to generate images from diffusion model.

## Official discord

https://discord.gg/38Sd7gcBnu

## Performance Requirements

## How to use

1. Download and install the installer from Assets.
2. Once the installation is complete, launch the shortcut. Note that the first launch may take some time due to initial setup.
3. From the Model category, import the desired model. Check the supported formats in the Model Load Window.
5. After importing the model, select and load it from the list.
6. Once loaded, input a prompt to begin generating images.

## How to start debugging

By following these steps, you can start debugging.

### 1. Set up the environment

Install Node.js.
The version at the time of development is as follows.

```shell
> node --version
v18.14.2
> npm --version
9.5.0
```

### 2. Download this repository

Clone this repository.

```sh
git clone https://github.com/Limitex/Source-Diffusion
cd Source-Diffusion
```

### 3. Prepare node

The following commands can be run in the repository to set it up

```sh
npm run setup
```

### 4. Execution

There are two types of execution: one with electron-forge and the other without.

You can execute with either.

* default

```sh
npm run debug 
```

* electron-forge

```sh
npm run start
```

## Credit
