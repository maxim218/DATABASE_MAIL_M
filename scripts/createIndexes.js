"use strict";



function getDropIndexes() {
    let data = "\n";
    ///////////////////////////////

    for(let i = 1; i <= 30; i++) {
        data = data + "DROP INDEX IF EXISTS ind_" + i + "; \n";
    }

    ///////////////////////////////
    data += "  ";
    return data;
}

function getCreateIndexes() {
    let data = "\n";
    ///////////////////////////////

    data = data + "CREATE INDEX ind_1 ON student USING btree ( LOWER(student_email) ); " + "\n";
    data = data + "CREATE INDEX ind_2 ON student USING btree ( LOWER(student_nickname) ); " + "\n";
    data = data + "CREATE INDEX ind_3 ON forum USING btree( LOWER(forum_slug) ); " + "\n";
    data = data + "CREATE INDEX ind_4 ON pair USING btree( pair_forum_id, pair_student_id );" + "\n";
    data = data + "CREATE INDEX ind_5 ON thread USING btree( LOWER(thread_slug) ); " + "\n";
    data = data + "CREATE INDEX ind_6 ON post USING btree (post_id, post_thread_id);" + "\n";
    data = data + "CREATE INDEX ind_7 ON vote USING btree (vote_thread_id, LOWER(vote_nickname) );" + "\n";
    data = data + "CREATE INDEX ind_8 ON vote USING btree (vote_thread_id); " + "\n";
    data = data + "CREATE INDEX ind_9 ON post USING btree (post_thread_id, post_parent, post_starting_number);" + "\n";
    data = data + "CREATE INDEX ind_10 ON post USING btree (post_starting_number, post_main_array); " + "\n";
    data = data + "CREATE INDEX ind_11 ON post USING btree (post_thread_id, post_main_array); " + "\n";
    data = data + "CREATE INDEX ind_12 ON post USING btree (post_thread_id, post_id); " + "\n";
    data = data + "CREATE INDEX ind_13 ON post USING btree (post_thread_id, post_id, post_parent, post_starting_number, post_main_array); " + "\n";
    data = data + "CREATE INDEX ind_14 ON student USING btree ( LOWER(student_nickname), student_id, student_nickname);" + "\n";
    data = data + "CREATE INDEX ind_15 ON pair USING btree (pair_forum_id); " + "\n";
    data = data + "CREATE INDEX ind_16 ON thread USING btree (thread_forum_id, thread_created); " + "\n";
    data = data + "CREATE INDEX ind_17 ON vote USING btree (vote_thread_id, LOWER(vote_nickname), vote_nickname, vote_voice);" + "\n";
    data = data + "CREATE INDEX ind_18 ON post using btree (post_id); " + "\n";
    data = data + "CREATE INDEX ind_19 ON student USING btree ( LOWER(student_nickname), student_id ); " + "\n";
    data = data + "CREATE INDEX ind_20 ON vote USING btree ( vote_thread_id, LOWER(vote_nickname), vote_nickname, vote_voice ); " + "\n";
    data = data + "CREATE INDEX ind_21 ON vote USING btree ( vote_thread_id, LOWER(vote_nickname) ); " + "\n";
    data = data + "CREATE INDEX ind_22 ON vote USING btree ( vote_thread_id, vote_voice ); " + "\n";
    data = data + "CREATE INDEX ind_23 ON thread USING btree ( LOWER(thread_slug), thread_id); " + "\n";

    ///////////////////////////////
    data += "  ";
    return data;
}
