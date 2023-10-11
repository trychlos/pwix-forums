/*
 * pwix:forums/src/common/i18n/fr_FR.js
 */

Forums.i18n = {
    ...Forums.i18n,
    ...{
        // have a 'fr' key so that it is used even if the application asks for 'fr_FR'
        fr: {
            allPosts: {
                page_title: 'Tous les posts',
                page_comment: 'Vous voyez ici tous les messages depuis la date spécifiée, postés dans les forums dont l\'accès vous est autorisé.'
            },
            badges: {
                for_public: 'Forum public',
                for_private: 'Forum privé',
                for_rw: 'Forum actif',
                for_ro: 'Forum archivé',
                forums_count: '%s forum(s)',
                moderator: 'Moderateur',
                threads_count: '%s discussions(s)',
                posts_count: '%s messages(s)',
                new_thread: 'Nouvelle discussion',
                new_label: 'Nouveau',
                mod_strategy: 'Strategie de modération'
            },
            breadcrumb: {
                forums: 'Forums',
                posts: 'Messages',
                threads: 'Discussions'
            },
            category_edit: {
                color_label: 'Couleur',
                modal_edit: 'Editer une catégorie',
                modal_new: 'Créer une nouvelle catégorie',
                title_label: 'Titre',
                title_placeholder: 'Saisissez un titre ic',
                description_label: 'Description affichée',
                description_placeholder: 'Ecrivez ici une description de quelques lignes qui sera affichée en regard de la catégorie',
                btn_close: 'Annuler',
                btn_save: 'Sauevgarder',
                message_updated: 'Categorie "%s" mise à jour avec succès',
                message_created: 'Categorie "%s" créée avec succès'
            },
            color: {
                choose: 'Choisissez une couleur',
                current: 'Sélection courante'
            },
            forum_edit: {
                modal_edit: 'Editer un forum',
                modal_new: 'Créer un nouveau forum',
                props_tab: 'Propriétés',
                privusers_tab: 'Utilisateurs privés',
                privusers_text: 'Sélectionnez les utilisateurs qui seront autorisés à participer à ce forum.',
                moderators_tab: 'Modérateurs',
                moderators_text: 'Sélectionnez les utilisateurs qui seront autorisés à modérer ce forum (en sus du rôle \'FRS_MODERATOR\').',
                title_label: 'Titre',
                title_placeholder: 'Un titre sur une ligne',
                description_label: 'Description affichée',
                description_placeholder: 'Ecrivez ici une description de quelques lignes qui sera affichée en regard du forum',
                comment_label: 'Commentaire interne',
                comment_placeholder: 'Un commentaire qui sera seulement visible des autres administrateurs',
                category_label: 'Categorie',
                private_label: 'Privé',
                moderation_label: 'Stratégie de modération',
                inform_label: 'Informer l\'auteur',
                show_deleted_for_admin_label: 'Montre les messages supprimés aux admins (comme un élément déroulable)',
                show_deleted_for_user_label: 'Montre les messages supprimés aux utilisateurs (comme un élément simple)',
                archive_label: 'Archive le forum, le positionnant en lecture seule',
                forum_archived: 'Le forum est archivé, et donc en lecture seule',
                archived_by_label: 'Opéré le %s par %s (%s)',
                unarchive_label: 'Désarchive le forum, et le réouvrir pour ses utilisateurs',
                btn_close: 'Annuler',
                btn_save: 'Sauvegarder',
                btn_private: 'Utilisateurs privés',
                message_error: 'Désolé, je n`arrive pas à mettre à jour cet enregistrement',
                message_updated: 'Le forum "%s" a été mis à jour avec succès',
                message_created: 'Le forum "%s" a été créé avec succès',
                informs: [
                    { id: Forums.C.Information.NONE, label: 'L\'auteur n\'est pas informé' },
                    { id: Forums.C.Information.MAY, label: 'Le modérateur peut choisir d\'informer l\'auteur' },
                    { id: Forums.C.Information.MUST, label: 'L\'auteur doit être informé' }
                ],
                informs_long: [
                    { id: Forums.C.Information.NONE, label: 'Etant donnée l\'option d\'information positionnée sur ce forum, l\'auteur ne sera pas informé de votre décision.' },
                    { id: Forums.C.Information.MAY, label: 'L\'option d\'information positionnée sur ce forum vous permet de choisir d\'informer - ou non - l\'auteur, et de lui fournir une raison.' },
                    { id: Forums.C.Information.MUST, label: 'L\'option d\'information positionnée sur ce forum rend obligatoire l\'information de l\'auteur, et la fourniture d\'une raison.' }
                ]
            },
            forums_home: {
                page_title: 'Forums de discussion',
                last_post: 'Dernier message le %s<br/>par %s'
            },
            manager: {
                manager_title: 'Gestion des forums',
                forums_nav: 'Forums',
                categories_nav: 'Categories',
                settings_nav: 'Paramètres',
                tree_nav: 'Hiérarchie des forums',
                btn_new: 'Nouveau',
                default_category_label: 'Sans catégorie'
            },
            moderate: {
                // moderation page
                page_title: 'Modération des forums',
                page_comment: 'Vous voyez ici tous les messages depuis la date spécifiée, postés dans les forums que vous êtes autorisés à modérer.',
                date: 'Depuis le :',
                noforum: 'Rien à modérer',
                nonewpost: 'Pas de nouveau message depuis le %s',
                thread_title: 'Dans la discussion «&nbsp;<b>%s</b>&nbsp;»',
                ellipsis_more: '[Lire plus]',
                ellipsis_less: '[Lire moins]',
                moderate_date: 'Posté le %s',
                owner_score: '%s messages postés<br />%s (%s) ont déjà été modérés',
                author: 'Par %s (aka « %s »)',
                moderate: 'Modérer',
                unmoderate: 'Démodérer',
                unmoderated: 'Le message a été démodéré avec succès',
                validate: 'Valider',
                unvalidate: 'Dévalider',
                validated: 'Le message a été validé avec succès',
                unvalidated: 'Le message a été dévalidé avec succès, attend maintenant une nouvelle validation',
                validated_checkbox: 'Affiche également les messages validés',
                moderated_checkbox: 'Affiche également les messages modérés',
                empty_checkbox: 'Affiche également les forums sans messages à modérer',
                validated_by: 'Validé par %s<br />le %s',
                moderated_by: 'Modéré par %s<br />le %s',
                // moderation operation
                modal_title: 'Modérer un message',
                pre_text: 'Vous êtes sur le point de modérer (supprimer) un message.'
                    +'<br />Après votre opération, ce message ne sera plus visible des utilisateurs.',
                post_text: 'Etes-vous sûr ?',
                inform_label: 'Envoie un mail d\'information à l\'auteur',
                reason_label: 'Choisissez une raison (une façon facile de motiver votre décision):',
                cancel: 'Annuler',
                confirm: 'Confirmer',
                content_label: 'Contenu du message :',
                owner_label: 'Auteur :',
                owner_posted: '%s messages postés, parmi lesquels %s (%s) ont déjà été modérés.',
                message_error: 'Désolé, je ne suis pas capable de mettre à jour cet enregistrement',
                message_success: 'Message modéré avec succès',
                options: [
                    // doesn't translate the id here, but only the label
                    { id: 'gtu', label: 'Non conforme aux Conditions Générales d\'Utilisation' },
                    { id: 'donotlove', label: 'Je ne vous aime pas' }
                ],
                strategies: [
                    { id: Forums.C.Moderation.NONE, label: 'Sans modération' },
                    { id: Forums.C.Moderation.APRIORI, label: 'Modération a priori' },
                    { id: Forums.C.Moderation.APOSTERIORI, label: 'Modération a posteriori' }
                ],
                short_strategies: [
                    { id: Forums.C.Moderation.NONE, label: 'Sans' },
                    { id: Forums.C.Moderation.APRIORI, label: 'A priori' },
                    { id: Forums.C.Moderation.APOSTERIORI, label: 'A posteriori' }
                ],
                supplement_label: 'Vous pouvez argumenter votre décision, et fournir une ou des raisons supplémentaires :',
                supplement_placeholder: 'Quelques mots facultatifs comme un argument supplémentaire',
                // moderation informations
                info_title: 'Informations sur la modération',
                reason: 'La raison était : "%s".',
                no_supplement: 'Aucun argument supplémentaire n\'a été fourni.',
                supplement_text: 'Un argument supplémentaire était : "%s".'
            },
            post_edit: {
                title_label: 'Fournissez un titre',
                title_placeholder: 'Un titre descriptif pour l\'objet de votre discussion',
                preview_btn: 'Prévisualiser',
                cancel_btn: 'Annuler',
                post_btn: 'Poster',
                preview_mode: 'La prévisualisation est activée. Votre message n\'a pas encore été posté. N\'oubliez pas de le \'Poster\'.',
                msg_error: 'Je suis incapable de poster votre message. Désolé.',
                msg_success: 'Votre message a été posté avec succès'
            },
            posts: {
                not_writable: 'Vous ne pouvez pas participer parce que %s.'
            },
            posts_options: {
                date_label: 'Depuis le :',
                empty_checkbox: 'Afficher les forums sans message visible',
                validated_checkbox: 'Afficher les messages validés',
                nonvalidated_checkbox: 'Afficher les messages non validés',
                moderated_checkbox: 'Afficher les messages modérés',
                nonmoderated_checkbox: 'Afficher les messages non modérés',
                deleted_checkbox: 'Afficher également les messages supprimés par leur auteur',
                date_parse: 'dd/mm/yy',
                date_format: 'dd/mm/yyyy'
            },
            roles_view: {
                perms_tab: 'Permissions sur les forums',
                public_label: 'En tant qu\'utilisateur authentifié, vous pouvez voir et participer à tous les forums publics.',
                private_label: 'Vous êtes également autorisés à voir et à participer aux forums privés suivants :',
                moderators_label: 'Vous étes égaleent autorisés à modérer les forums suivants :',
                none: 'Pas d\'autre permission.'
            },
            settings_tab: {
                description: 'Pas de paramètres modifiables pour le moment.'
            },
            threads: {
                page_title: 'Discussions récentes dans le forum',
                new: 'Commencer une nouvelle discussion',
                title_header: 'Titre',
                start_header: 'Commencée',
                count_header: 'Nb de messages',
                last_header: 'Dernier message',
                no_threads: 'Il n\'y a encore aucune discussion ouverte sur ce forum.'
                    +'<br />Soyez le premier à en créer une (cliquez sur le bouton "Nouvelle discussion" en haut à droite de cette page).'
                    +'<br />Et profitez-en...',
                not_writable: 'Il n\'y a encore aucune discussion ouverte sur ce forum.'
                    +'<br />Malheureusement, vous n\'êtes pas autorisés à créer une nouvelle discussion.'
                    +'<br />La raison en est que %s.'
                    +'<br />Contactez votre administrateur si vous n\'êtes pas sûr ou souhaitez des éclaircissements.',
                owner_header: 'Auteur',
                reply: 'Répondre',
                posted_by: 'Posté par %s',
                posted_on: 'Le %s',
                last_post: 'Dernier message le %s<br/>par %s',
                tooltip: 'Ouvrir la discussion (et aller à \'%s\')',
                deleted_label: 'Vous avez supprimé l\'un de vos propres messages le %s. Cette opération ne peut pas être annulée',
                moderated_label: 'Un message a été modéré le %s par %s (raison : %s)',
                delete: 'Supprimer',
                delete_confirm: 'Vous êtes sur le point de supprimer votre message.<br />Etes-vous sûr ?',
                delete_error: 'Je suis incapable de supprimer votre message pour le moment. Désolé',
                delete_success: 'Message supprimé avec succès',
                edit: 'Editer',
                moderate: 'Modérer'
            },
            tree_tab: {
                description: 'Les catégories, aussi bien que les forums qui leur sont attachés, peuvent être mis à jour ici.'
                    +'<br />L\'ordre des catégories, l\'ordre des forums, et même le rattachement d\'un forum à une catégorie, peuvent être facilement modifiés par un simple glisser-déplacer avec votre souris.'
                    +'<br />C\'est aussi le bon endroit pour créer de nouvelles catégories et/ou de nouveaux forums.',
                cat_info: 'Informations sur la catégorie',
                for_info: 'Informations sur le forum',
                cat_confirm_delete: 'Vous êtes sur le point de supprimer la catégorie "%s"<br />Etes-vous sûr ?',
                cat_deleted: 'Catégorie "%s" supprimée avec succès.',
                for_confirm_delete: 'Vous êtes sur le point de supprimer le forum "%s"<br />Etes-vous sûr ?',
                for_deleted: 'Forum "%s" supprimé avec succès.',
                cat_color: 'La coueur de la catégorie',
                cat_edit: 'Editer la catégorie \'%s\'',
                cat_delete: 'Supprimer la catégorie \'%s\'',
                for_edit: 'Editer le forum \'%s\'',
                for_delete: 'Supprimer le forum \'%s\'',
                catcount_plural: '%s catégories enregistrées',
                catcount_singular: '%s catégorie enregistrée',
                catcount_none: 'Aucune catégorie enregistrée',
                forcount_plural: '%s forums enregistrés',
                forcount_singular: '%s forum enregistré',
                forcount_none: 'Aucun forum enregistré',
                forum_new: 'Nouveau forum',
                category_new: 'Nouvelle catégorie'
            },
            // these strings are to be added to a sentence - so do not begin with a capital
            unwritable: {
                FRS_REASON_NONE: '(pas de raison)',
                FRS_REASON_NOTCONNECTED: 'vous n\'êtes pas connecté',
                FRS_REASON_NOEMAIL: 'votre profil ne contient pas d\'adresse de messagerie',
                FRS_REASON_NOTVERIFIED: 'Votre adresse de messagerie n\'a pas encore été vérifiée',
                FRS_REASON_APPFN: 'la participation est refusée par l\'application',
                FRS_REASON_PRIVATEWRITERS: 'PRIVATEWRITERS',
                FRS_REASON_PRIVATEEDIT: 'PRIVATEEDIT',
                FRS_REASON_PRIVATE: 'vous n\'êtes pas autorisés à participer à ce forum privé'
            }
        }
    },
};
