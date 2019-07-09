# Table of Contents
* [About](#about)
* [Gameplay](#gameplay)
* [Model](#model)
    - [Common](#common)
    - [World](#world)
    - [Plant](#plant)
    - [City](#city)
* [Units](#units)
* [Transport system](#transport-system)
    - [Transport types](#transport-types)
    - [Vehicle types](#vehicle-types)
    - [Cargo](#cargo)


# About
**Transportflow** is a video game developed by **Dynomint studio**. Development started in 2019 and is still ongoing. First public release is planned for early 2020.


# Gameplay


# Model
This section describes entities that used in the game. It will give you better understanding of the subject area and game mechanics.

## Common

### Game state
Game state is a set of variables describing everything that happens. Every render frame, every sound, everything is based on game state. It is changed through services, which invoked through GUI itself.

### Tile map
Tile map is a set of [tiles](#tile) including its communication. Tile map is generated using [World generator](#world-generator) once the game is created and used in [Game state](#game-state).

### Tile
Tile is a smallest game entity. Describes a piece of land. Stores info about [land](#land), [roads](#road) and [buildings](#building).

Has 3 layers: ground, underground and overground. It needs to be able to store [bridges](#bridge) and [tunnels](#tunnel).


## World
Game state from the natural aspect.

### Land
Land is a state of a [tile](#tile) describing its surface natural material. It can be soil, sand, snow, rock and water. More info about surface [here](#surface).

### Biome
Biome is a set of [tiles](#tile) with the same [surface](#surface).

### Surface
Surface is a material of a [tile](#tile) itself. There are 5 types of surface, corresponding to 3 different [biomes](#biome).

Surface|Biome |Description
-------|------|-----------
Soil   |Taiga |Green color land (due to grass on soil) with [trees](#tree)
Sand   |Desert|Yellow color land (due to sand) with [tumbleweeds](#tumbleweed)
Snow   |Snowy |White color land (due to snow) with [trees](#tree)
Rock   |-     |Gray color surface (due to rock). Cannot build on them, only [tunnels](#tunnel) allowed
Water  |-     |Blue color surface (due to water). Cannot build on them, except [water ports](#water-port). Used to create [water routes](#water-route)

## Plant
Natural creations placed on tiles.

### Tree
Plant growing in [Taiga biome](#biome).

### Tumbleweed
Plant growing in [Snowy biome](#biome).

## City
[Human](#population) settlement. Cities are generated randomly using [World generator](#world-generator).

City wealth is described with its [population](#population). Each city has its own [facilities](#facility).

### Population
Population is amount of people live in it. The one of [game units](#units).


# Units
There are several in-game units.

Unit             |Short         |Type      |Description
-----------------|--------------|----------|-----------
Meter            |m             |Distance  |Distance between two [tiles](#tile). One tile is 1x1 meter
Meter<sup>2</sup>|m<sup>2</sup> |Area      |Area
People           |p             |Population|Amount of people
Ton              |t             |Weight    |Weight of a [cargo](#cargo)


# Transport system

## Transport types
There are 4 types of transport: [Roadway](#roadway), [Railway](#railway), [Airway](#airway), [Waterway](#waterway).

Each of them correspond to some [vehicle type](#vehicle-types).

Transport type        |Vehicle type
----------------------|------------
[Roadway](#roadway)   |[Car](#car)
[Railway](#railway)   |[Train](#train)
[Airway](#airway)     |[Plane](#plane)
[Waterway](#waterway) |[Ship](#ship)

### Roadway

### Railway

### Airway

### Waterway

## Vehicle types
There are 4 types of vehicles: [Car](#car), [Train](#train), [Plane](#plane), [Ship](#ship).

Each of them correspond to some [transport type](#transport-types).

Transport type       |Vehicle type
---------------------|------------
[Roadway](#roadway)  |[Car](#car)
[Railway](#railway)  |[Train](#train)
[Airway](#airway)    |[Plane](#plane)
[Waterway](#waterway)|[Ship](#ship)

### Car

### Train

### Plane

### Ship

## Depot

## Routes

## Cargo

### Cargo list

### Cargo tree

## Facility
Each city has it's own facilities. There are 3 types.

Type            |Functionality
----------------|-------------
Supplier        |Create cargo, not require raw material
Manufacturer    |Create cargo, require other cargo as raw material. Manufacturing schemas [here](#cargo-tree)
Consumer        |Not create cargo, require other cargo to consume

### Facility list