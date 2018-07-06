The game has some key landmarks that have significance to the gameplay, this is where we will start our
procedural generation. We first put pins down where these key landmarks are to be located. We will define
these landmarks as: the mountain, the lake, the town, the forest and the clearing.

<figure>
    <img src="/procedural-terrain-generation/img/landmarks.svg" alt="Landmark sequence"/>
    <p><strong>Figure 2.</strong> The key landmark sequence for <em>They Arrive</em> gameplay.
</figure>

We will also define the rules:

1. The distance from the mountain to the clearing **must** be greater than the mountain to the
town and the town to the clearing, i.e. the town must be somewhere loosely between the mountain and the
clearing.
2. The distance from the town to the clearing **should** be greater than the town to the forest
and the forest to the clearing.
3. Also the distance from the mountain to the town **should** be greater than the mountain to
the lake and the lake to the town.
4. All landmarks **must** appear within the play area plus some distance; we wish to avoid
the occurrence of landmarks appearing at the very edge of the playable map.

One way we could do this is to pick five points at random within the play area (with the extra distance
from the boundary deducted) and then calculate the combinations landmark placements. The number of
combinations are reasonably small, <math><mn>5</mn><mo>!</mo></math> (120), that we can do this. Then we
calculate a score based on the rules above, picking one of the highest scoring solutions at random. We
can also add a minimum score threshold, which if none of the combinations pass we pick a new set of
points and start again.

<figure>
    <div id="random-landmarks-interactive-figure"></div>
</figure>

The solution gives acceptable results, however, if we were to decide later to add more important landmarks
the problem space may grow very quickly.

Alternatives could be to instead take the five points as nodes of a complete digraph and expand these
into all of the edges, there are ten edges for a five node graph. We can then perform a search
to find the highest scoring combination. We could also place the points iteratively warping the space
to increase the likelihood of placing the points in valid locations.

In the next post we will explore how to split the map into regions based on these landmarks using a
technique called Voronoi Tessellation.
