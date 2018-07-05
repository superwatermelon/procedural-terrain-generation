Here at Superwatermelon we are currently working on a first-person survival game: _They Arrive_. A big
part of the gameplay revolves around the map being different each time you play. It is designed to be
a quick casual (pick-up-and-play) arcade-style experience and we wanted to prevent the player from being
able to remember the locations of all of the useful pickups and strategic points so that each play through
is a slightly different experience.

Techniques to generate landscapes and terrains have been actively developed since at least the early 80s
with increasing realism. Modern games have been able to procedurally generate entire galaxies,
where storing that much map content to disk would be prohibitively expensive. _They Arrive_ is designed to
be roughly 10km² of playable area and so this is far smaller in scale and gives us more freedom in
how we procedurally generate our maps.

In this series of articles we will cover the techniques we are exploring to be able to implement the
procedural generation used within the game. To begin with we will start by defining the major areas of the
map.

## Key game areas

<figure>
    <img alt="Diagram of the play area" src="/img/play-area.svg"/>
    <p>
        <strong>Figure 1.</strong> The key areas of <em>They Arrive</em> with respects to overall gameplay
        and terrain generation.
    </p>
</figure>

The map area we are trying to build consists of three major areas.

### 1. The visible area

This is the greater area which will be generated but may only require some of the more basic generation
techniques, the player will never end up in this area and no interactive features or passable terrain
need exist here, however, it should look like a continuation of the terrain and be visually interesting.

### 2. The boundary area

The boundary area is an area that can be traversed but in which no game detail will be found, it is used
as a soft boundary for the game, upon entering this area a countdown is presented with instruction for the
player to return to the play area. It may require slightly more complexity in generation techniques than
the visible area being mostly traversable by the player, more detail will be visible to the player in this
area.

### 3. The playable area

Finally, and most importantly, we have the main playable area, which contains key landmarks that are
important to the storyline and will appear in every play-through but will appear in different locations
each time. The terrain generated will vary based on the properties of regions (or subdivisions) of this
area, from mountainous areas to forests and flatlands. The terrain will need to be visually interesting
and will also feature rules based placement of pickups, roads, buildings, spawned enemies. Needless to
say this last area is where the most of our techniques will come into play and is the most complex of
the three.

In the next post we will be looking at how we can place our key landmarks in random locations while
maintaining the correct game flow.

Next: [Part 2. Landmark Placement](https://blog.superwatermelon.com/procedural-terrain-generation/landmark-placement)
