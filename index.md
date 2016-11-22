---
layout  : default
title   : "Time is ticking."
---


Posts
==========
<div class="container">
    <div class="row">
        <ul class="posts">
        {% for post in site.posts %}
            <li>
                <a href="{{ post.url }}">
                    <h2>{{post.title}}</h2> 
                    <p>{{ post.excerpt | strip_html | truncatewords: 12 }}</p>
                </a>
            </li>    
        {% endfor %}
        </ul>
    </div>
</div>