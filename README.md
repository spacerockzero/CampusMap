<section id="features">
          <div class="page-header">
            <h1>Features</h1>
          </div>
          <p>The Campus Maps contain several features that will students, faculty, as well as parents or other visitors to easily navigate the BYU-Idaho Campus.  It utilizes Googles data rich maps, as well as our own object files to help others locate points of interest around campus.  It allows a user to navigate through a list of categories to find specific locations that they would like to find.  To aid in finding these points a search function has been added to allow users to search for what they are looking for.</p>
          <h5>August 8, 2013</h5>
          <p>The campus maps are now embeddable and allow for people to place them into their pages with just one script inclusion and one global options object.</p>
          <p>It also is written in OOP for better sustainability and progression.</p>
          <h3>Future Features</h3>
          <p>There are many possible additions that have been proposed to The Campus Maps</p>
          <ul>
            <li>Allowing a user to get directions to a location right in the app.</li>
            <li>Allowing users to submit corrections to locations, or submit additional locations to be considered.</li>
            <li>Making the maps indexable by creating an XML document in Ingeniux that allows search engines to index the unique URLS for each location.</li>
            <li>Making the data be pulled from the schools GIS servers and allow faculty to submit additions.</li>
            <li>Make it location aware so that you can see where you are in relation to everything else.</li>
            <li>Performance enhancements to make it faster and more responsive to user interaction.</li>
            <li>Put everything inside a module to not flood the Window object
                <ul>
                  <li>Currently each object has it's own copy of the window and document object to keep them local but if it's in a module this can be changed</li>
                </ul>
          </ul>
        </section>
        <section id="why-new">
          <div class="page-header">
            <h1>Why a new campus map?</h1>
          </div>
          <p>The old campus map was a flash based version.  Because of the increasing use of mobile devices, flash quickly became obsolete and a new, javascript version needed to be created.  Because it needs to be optomized for mobile, it needed to be incorporate responsive design to allow it to scale between various devices.</p>
          <p>Also with the improvments to Google's mapping system it became obvious we needed to move to such a platform where some of the data and work could be abstracted away from our development and allow others to take up the harder challenges.</p>
        </section>
        <section id="parking-information">
          <div class="page-header">
            <h1>Parking information</h1>
          </div>
          <p>I don't have much to say about this other than that the maps have most of the parking outlined.</p>
        </section>
        <section id="content">
          <div class="page-header">
            <h1>Content</h1>
          </div>
          <p>The Campus Maps incorporates data from many different categories such as, Buildings, Vending Machines, Parking, Restaraunts, and Web Cams.  This initial data is all stored in a single JSON file that the maps uses to populate all of the data within itself.</p>
          <p>There have been suggestions that now that Campus Maps is within Ingeniux we can automate some of the Data retrieval and processing so that we as developers do not need to be the only ones capable of updating information within maps.</p>
          <p>Other data such as Blue Emergency Phones, events, and other user submitted data have been suggested in order to allow the maps to more fully represent all points of interest on campus.</p>
        </section>
        <section id="extra-functionality">
          <div class="page-header">
            <h1>Extra functionality</h1>
          </div>
          <p>Currently there is no functionality of the Maps that hasn't already been noted either as current or future, and isn't available to the public.</p>
        </section>
        <section id="new-changes">
          <div class="page-header">
            <h1>New Changes</h1>
          </div>
          <h4>July 31, 2013</h4>
          <ul>
            <li>Added search capabilities.</li>
            <li>Added the ability to pull up a location with a unique URL.</li>
            <li>Added sharing functionality</li>
            <li>Uploaded everything to Ingeniux and it now runs in Ingeniux</li>
          </ul>
          <h4>August 26, 2013</h4>
          <ul>
            <li>Developed using OOP</li>
            <li>Maps can be embedded with a single script file and a global options object</li>
          </ul>
        </section>
