package tz.mkcot.model;

import java.util.List;

/** Nafasi za watumiaji. */
public final class Roles {
    public static final String ANASUBIRI = "anasubiri";
    public static final String MWANACHAMA = "mwanachama";
    public static final String MALIPO = "malipo";
    public static final String KATIBU = "katibu";
    public static final String MHAZINI = "mhazini";
    public static final String MSOMAJI = "msomaji";
    public static final String MSIMAMIZI = "msimamizi";

    public static final List<String> ALL = List.of(ANASUBIRI, MWANACHAMA, MALIPO, KATIBU, MHAZINI, MSOMAJI, MSIMAMIZI);

    private Roles() {}
}
